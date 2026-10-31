import com.sun.source.util.JavacTask;
import com.sun.tools.javac.api.JavacTool;
import com.sun.tools.javac.code.*;
import com.sun.tools.javac.code.Symbol.*;
import com.sun.tools.javac.tree.JCTree;
import com.sun.tools.javac.tree.JCTree.*;
import com.sun.tools.javac.tree.TreeScanner;
import com.sun.tools.javac.util.Context;
import com.sun.tools.javac.comp.Resolve;
import com.sun.tools.javac.comp.Env;
import com.sun.tools.javac.comp.AttrContext;

import javax.tools.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;

/**
 * Java -> JavaScript translator used for the Air Attack web port.
 * Front end: the JDK's own javac (parse + attribute), so overloads, generics, constants and numeric
 * promotions are resolved exactly like the real compiler does. Back end: JsGen (JS text).
 *
 * usage: Transpiler --out <file.js> --report <file.txt> --seeds A,B,C --src dir1[,dir2...] [--root name]
 */
public class Transpiler {
    public static void main(String[] args) throws Exception {
        String out = null, report = null, seeds = "", srcs = "";
        List<String> extraRoots = new ArrayList<>();
        Set<String> blockNames = new HashSet<>();
        boolean apiMode = false;
        for (int i = 0; i < args.length; i++) {
            switch (args[i]) {
                case "--out": out = args[++i]; break;
                case "--report": report = args[++i]; break;
                case "--seeds": seeds = args[++i]; break;
                case "--src": srcs = args[++i]; break;
                case "--root": extraRoots.add(args[++i]); break;
                case "--block": for (String b : args[++i].split(",")) if (!b.isBlank()) blockNames.add(b.trim()); break;
                case "--api": apiMode = true; break;
                default: throw new IllegalArgumentException("unknown arg " + args[i]);
            }
        }
        List<File> files = new ArrayList<>();
        // later dirs override earlier ones for identical relative paths (overlay semantic)
        Map<String, File> byRel = new LinkedHashMap<>();
        for (String d : srcs.split(",")) {
            Path base = Paths.get(d);
            try (var st = Files.walk(base)) {
                for (Path p : (Iterable<Path>) st.filter(x -> x.toString().endsWith(".java"))::iterator) {
                    byRel.put(base.relativize(p).toString(), p.toFile());
                }
            }
        }
        files.addAll(byRel.values());

        DiagnosticCollector<JavaFileObject> diags = new DiagnosticCollector<>();
        JavacTool tool = JavacTool.create();
        StandardJavaFileManager fm = tool.getStandardFileManager(diags, null, StandardCharsets.UTF_8);
        Iterable<? extends JavaFileObject> units = fm.getJavaFileObjectsFromFiles(files);
        List<String> opts = Arrays.asList("-proc:none", "-Xlint:none", "--release", "8",
                "-XDshould-stop.ifError=FLOW", "-XDshould-stop.ifNoError=FLOW", "-Xmaxerrs", "100000", "-g:none");
        Context jctx = new Context();
        NoAccessResolve.install(jctx); // decompiled code relies on synthetic accessors: ignore Java access rules (JS has none)
        JavacTask task = tool.getTask(null, fm, diags, opts, null, units, jctx);
        Iterable<? extends com.sun.source.tree.CompilationUnitTree> parsed = task.parse();
        task.analyze();

        List<JCCompilationUnit> cus = new ArrayList<>();
        for (var cu : parsed) cus.add((JCCompilationUnit) cu);

        Model model = new Model(cus);
        // reachability
        List<ClassSymbol> seedSyms = new ArrayList<>();
        for (String s : seeds.split(",")) {
            if (s.isBlank()) continue;
            ClassSymbol cs = model.byName.get(s.trim());
            if (cs == null) { System.err.println("seed not found: " + s); continue; }
            seedSyms.add(cs);
        }
        for (String b : blockNames) { ClassSymbol bs = model.byName.get(b); if (bs != null) model.blocked.add(bs); else System.err.println("block target not found: " + b); }
        Set<ClassSymbol> reach = model.reachable(seedSyms);
        if (System.getenv("DUMP_REACH") != null) { for (ClassSymbol c : reach) { ClassSymbol p = model.parent.get(c); System.err.println("REACH " + c.flatname + " <- " + (p == null ? "-" : p.flatname)); } }
        if (apiMode) { model.printApi(); return; }

        // diagnostics restricted to reachable files
        Set<String> reachFiles = new HashSet<>();
        for (ClassSymbol c : reach) {
            JCClassDecl d = model.decls.get(c);
            if (d != null && model.fileOf.get(d) != null) reachFiles.add(model.fileOf.get(d));
        }
        int errs = 0;
        StringBuilder diagOut = new StringBuilder();
        for (Diagnostic<? extends JavaFileObject> d : diags.getDiagnostics()) {
            if (d.getKind() != Diagnostic.Kind.ERROR) continue;
            String f = d.getSource() == null ? "?" : new File(d.getSource().toUri()).getPath();
            if (!reachFiles.contains(f)) continue;
            errs++;
            diagOut.append(f.substring(f.lastIndexOf('/') + 1)).append(':').append(d.getLineNumber()).append(": ")
                    .append(d.getMessage(null).replace('\n', ' ')).append('\n');
        }
        System.err.println("reachable classes: " + reach.size() + "  compile errors in reachable files: " + errs);
        if (errs > 0) {
            System.err.print(diagOut.length() > 60000 ? diagOut.substring(0, 60000) : diagOut);
            if (System.getenv("KEEP_GOING") == null) System.exit(2);
        }

        Context ctx = ((com.sun.tools.javac.api.JavacTaskImpl) task).getContext();
        JsGen gen = new JsGen(model, reach, ctx);
        String js = gen.generate();
        Files.writeString(Paths.get(out), js);
        if (report != null) Files.writeString(Paths.get(report), gen.externalReport());
        System.err.println("wrote " + out + " (" + js.length() + " chars), classes emitted: " + gen.emittedCount);
    }
}

/** Indexes all classes of the compilation and answers reachability questions. */
class Model {
    final Map<ClassSymbol, JCClassDecl> decls = new LinkedHashMap<>();
    final Map<String, ClassSymbol> byName = new HashMap<>();
    final Map<JCClassDecl, String> fileOf = new HashMap<>();
    final Map<JCClassDecl, JCClassDecl> outerOf = new HashMap<>();

    Model(List<JCCompilationUnit> cus) {
        for (JCCompilationUnit cu : cus) {
            String f = new File(cu.getSourceFile().toUri()).getPath();
            for (JCTree d : cu.defs) {
                if (d instanceof JCClassDecl) index((JCClassDecl) d, f, null);
            }
        }
    }

    private void index(JCClassDecl cd, String file, JCClassDecl outer) {
        if (cd.sym == null) return;
        decls.put(cd.sym, cd);
        byName.put(cd.sym.flatname.toString(), cd.sym);
        byName.put(cd.sym.getQualifiedName().toString(), cd.sym);
        fileOf.put(cd, file);
        if (outer != null) outerOf.put(cd, outer);
        for (JCTree m : cd.defs) {
            if (m instanceof JCClassDecl) index((JCClassDecl) m, file, cd);
        }
    }

    boolean isStubFile(JCClassDecl d) {
        String f = fileOf.get(d);
        return f != null && f.contains("/stubs/");
    }

    /** a source class that must be translated (not a javac-only stub of an external API). */
    boolean isTranslated(ClassSymbol c) {
        JCClassDecl d = decls.get(c);
        return d != null && !isStubFile(d);
    }

    final Map<ClassSymbol, ClassSymbol> parent = new HashMap<>();
    final Set<ClassSymbol> blocked = new HashSet<>();
    final Map<ClassSymbol, Map<String, Set<String>>> apiUse = new TreeMap<>(Comparator.comparing(c -> c.flatname.toString()));

    void printApi() {
        for (Map.Entry<ClassSymbol, Map<String, Set<String>>> e : apiUse.entrySet()) {
            System.out.println("== " + e.getKey().flatname);
            for (Map.Entry<String, Set<String>> m : new TreeMap<>(e.getValue()).entrySet())
                System.out.println("   " + m.getKey() + "    <- " + String.join(",", m.getValue()));
        }
        for (ClassSymbol b : blocked) if (!apiUse.containsKey(b)) System.out.println("== " + b.flatname + " (unused by kept code)");
    }

    static String describe(Symbol s) {
        if (s instanceof MethodSymbol) {
            MethodSymbol m = (MethodSymbol) s;
            StringBuilder sb = new StringBuilder();
            if (m.isStatic()) sb.append("static ");
            sb.append(m.isConstructor() ? "<init>" : m.name.toString()).append('(');
            boolean f = true;
            for (Type p : m.type.getParameterTypes()) { if (!f) sb.append(", "); f = false; sb.append(p); }
            sb.append(')');
            if (!m.isConstructor()) sb.append(" : ").append(m.type.getReturnType());
            return sb.toString();
        }
        if (s instanceof VarSymbol) return (s.isStatic() ? "static " : "") + "field " + s.name + " : " + s.type;
        return "type";
    }
    Set<ClassSymbol> reachable(List<ClassSymbol> seeds) {
        Set<ClassSymbol> seen = new LinkedHashSet<>();
        Deque<ClassSymbol> work = new ArrayDeque<>();
        for (ClassSymbol s : seeds) { seen.add(s); work.add(s); }
        while (!work.isEmpty()) {
            ClassSymbol c = work.poll();
            JCClassDecl d = decls.get(c);
            if (d == null) continue;
            new TreeScanner() {
                void touch(Symbol s) {
                    if (s == null) return;
                    ClassSymbol ec = s instanceof ClassSymbol ? (ClassSymbol) s : (s.owner != null ? s.enclClass() : null);
                    if (ec != null && blocked.contains(ec) && ec != c) {
                        apiUse.computeIfAbsent(ec, k -> new HashMap<>()).computeIfAbsent(describe(s), k -> new TreeSet<>()).add(c.flatname.toString().replaceFirst("^dk\\.logisoft\\.", "dk.ls."));
                    }
                    ClassSymbol cs = null;
                    if (s instanceof ClassSymbol) cs = (ClassSymbol) s;
                    else if (s.owner != null) cs = s.enclClass();
                    while (cs != null) {
                        // nested class of a translated class: make sure the top is reachable too
                        if (isTranslated(cs) && !blocked.contains(cs) && seen.add(cs)) { work.add(cs); parent.put(cs, c); }
                        Symbol o = cs.owner;
                        cs = (o != null && !(o instanceof PackageSymbol)) ? o.enclClass() : null;
                    }
                }
                void touchType(Type t) {
                    if (t == null) return;
                    if (t.tsym instanceof ClassSymbol) touch(t.tsym);
                    if (t instanceof Type.ArrayType) touchType(((Type.ArrayType) t).elemtype);
                    if (t instanceof Type.ClassType) for (Type a : ((Type.ClassType) t).getTypeArguments()) touchType(a);
                }
                @Override public void visitIdent(JCIdent t) { touch(t.sym); touchType(t.type); super.visitIdent(t); }
                @Override public void visitSelect(JCFieldAccess t) { touch(t.sym); touchType(t.type); super.visitSelect(t); }
                @Override public void visitNewClass(JCNewClass t) { touch(t.constructor); if (t.clazz != null) touchType(t.clazz.type); super.visitNewClass(t); }
                @Override public void visitClassDef(JCClassDecl t) {
                    if (t.sym != null) {
                        for (Type s : types(t.sym)) touchType(s);
                    }
                    super.visitClassDef(t);
                }
                List<Type> types(ClassSymbol s) {
                    List<Type> r = new ArrayList<>();
                    Type sup = s.getSuperclass();
                    if (sup != null && sup.tsym != null) r.add(sup);
                    for (Type i : s.getInterfaces()) r.add(i);
                    return r;
                }
                @Override public void visitTypeCast(JCTypeCast t) { touchType(t.clazz.type); super.visitTypeCast(t); }
                @Override public void visitTypeTest(JCInstanceOf t) { touchType(t.pattern.type); super.visitTypeTest(t); }
                @Override public void visitVarDef(JCVariableDecl t) { touchType(t.sym == null ? null : t.sym.type); super.visitVarDef(t); }
                @Override public void visitLiteral(JCLiteral t) { super.visitLiteral(t); }
            }.scan(d);
            // every translated superclass/interface and every nested class of a reachable class is needed as well
            for (JCTree m : d.defs) {
                if (m instanceof JCClassDecl) {
                    ClassSymbol ns = ((JCClassDecl) m).sym;
                    if (ns != null && isTranslated(ns) && seen.add(ns)) work.add(ns);
                }
            }
        }
        return seen;
    }
}

/** javac Resolve that never reports access errors. */
class NoAccessResolve extends Resolve {
    NoAccessResolve(Context ctx) { super(ctx); }
    static void install(Context c) { c.put(Resolve.resolveKey, (Context.Factory<Resolve>) NoAccessResolve::new); }
    @Override public boolean isAccessible(Env<AttrContext> env, TypeSymbol c) { return true; }
    @Override public boolean isAccessible(Env<AttrContext> env, TypeSymbol c, boolean checkInner) { return true; }
    @Override public boolean isAccessible(Env<AttrContext> env, Type site, Symbol sym) { return true; }
    @Override public boolean isAccessible(Env<AttrContext> env, Type site, Symbol sym, boolean checkInner) { return true; }
}
