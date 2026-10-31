// Air Attack web port - Java runtime subset, part 1: language helpers used by the generated code.
// The translated code (build/game.js) follows the naming contract documented at the top of tools/JsGen.java.
// "use strict" is intentionally not at file level: everything is attached to globalThis so that the generated
// classes (separate script) can see it.
(function (G) {
  "use strict";

  // ------------------------------------------------------------------ class registry helpers
  function defClass(cls, jname, ifaces) {
    cls.$jname = jname;
    if (ifaces) cls.$ifaces = ifaces;
    G[jname.replace(/\./g, "_")] = cls;
    return cls;
  }
  function defIface(jname, supers) {
    const c = class { };
    c.$isIface = true;
    c.$jname = jname;
    if (supers) c.$ifaces = supers;
    G[jname.replace(/\./g, "_")] = c;
    return c;
  }
  G.$defClass = defClass;
  G.$defIface = defIface;

  // ------------------------------------------------------------------ numeric helpers (exact Java semantics)
  const MAXL = 9223372036854775807n, MINL = -9223372036854775808n;
  G.$d2i = function (d) {
    if (d !== d) return 0;
    if (d >= 2147483647) return 2147483647;
    if (d <= -2147483648) return -2147483648;
    return d | 0;
  };
  G.$d2l = function (d) {
    if (d !== d) return 0n;
    if (d >= 9223372036854775807) return MAXL;
    if (d <= -9223372036854775808) return MINL;
    return BigInt(Math.trunc(d));
  };
  G.$l = function (b) { return BigInt.asIntN(64, b); };
  G.$l2i = function (b) { return Number(BigInt.asIntN(32, b)); };
  G.$idiv = function (a, b) {
    if (b === 0) throw new java_lang_ArithmeticException().$init$String("/ by zero");
    return (a / b) | 0;
  };
  G.$irem = function (a, b) {
    if (b === 0) throw new java_lang_ArithmeticException().$init$String("/ by zero");
    return (a % b) | 0;
  };
  G.$ldiv = function (a, b) {
    if (b === 0n) throw new java_lang_ArithmeticException().$init$String("/ by zero");
    return BigInt.asIntN(64, a / b);
  };
  G.$lrem = function (a, b) {
    if (b === 0n) throw new java_lang_ArithmeticException().$init$String("/ by zero");
    return a % b;
  };
  G.$abs = function (i) { return Math.abs(i) | 0; };
  G.$toRadians = function (d) { return d / 180.0 * Math.PI; };
  G.$toDegrees = function (d) { return d * 180.0 / Math.PI; };

  // ------------------------------------------------------------------ float / double -> string (Java Float.toString / Double.toString)
  const f32 = new Float32Array(1), i32 = new Int32Array(f32.buffer);
  const f64 = new Float64Array(1), i64 = new BigInt64Array(f64.buffer), i32x2 = new Int32Array(f64.buffer);
  function javaFmt(shortest, digitsExp, neg) {
    // shortest: digit string without dot (no leading zeros), digitsExp: decimal exponent such that value = 0.d1d2d3... * 10^digitsExp
    // Java: 1e-3 <= |v| < 1e7 -> plain decimal, else computerized scientific notation
    const d = shortest, e = digitsExp; // value = 0.DIGITS * 10^e  => d1.d2d3... * 10^(e-1)
    let out;
    const sciExp = e - 1;
    if (sciExp >= -3 && sciExp < 7) {
      if (e <= 0) out = "0." + "0".repeat(-e) + d;
      else if (e >= d.length) out = d + "0".repeat(e - d.length) + ".0";
      else out = d.slice(0, e) + "." + d.slice(e);
    } else {
      out = d[0] + "." + (d.length > 1 ? d.slice(1) : "0") + "E" + sciExp;
    }
    return neg ? "-" + out : out;
  }
  function decompose(str) {
    // str: JS exponential string like "1.2345e+21" or plain; returns [digits, e] with value = 0.digits * 10^e
    let m = /^(\d+)(?:\.(\d+))?(?:e([+-]?\d+))?$/.exec(str);
    let ip = m[1], fp = m[2] || "", ex = m[3] ? parseInt(m[3], 10) : 0;
    let digits = ip + fp;
    let e = ip.length + ex;
    const lead = digits.match(/^0*/)[0].length;
    digits = digits.slice(lead); e -= lead;
    digits = digits.replace(/0+$/, "");
    if (digits === "") digits = "0";
    return [digits, e];
  }
  G.$dstr = function (x) {
    if (x !== x) return "NaN";
    if (x === Infinity) return "Infinity";
    if (x === -Infinity) return "-Infinity";
    if (x === 0) return (1 / x < 0) ? "-0.0" : "0.0";
    const neg = x < 0; if (neg) x = -x;
    const [d, e] = decompose(x.toExponential().replace("e", "e")) ;
    // toExponential() without argument gives as many digits as necessary (shortest round-trip)
    return javaFmt(d, e, neg);
  };
  G.$fstr = function (x) {
    if (x !== x) return "NaN";
    if (x === Infinity) return "Infinity";
    if (x === -Infinity) return "-Infinity";
    if (x === 0) return (1 / x < 0) ? "-0.0" : "0.0";
    const neg = x < 0; if (neg) x = -x;
    let s = null;
    for (let p = 1; p <= 9; p++) {
      const t = x.toPrecision(p);
      if (Math.fround(parseFloat(t)) === x) { s = parseFloat(t).toExponential(); break; }
    }
    if (s === null) s = x.toExponential();
    const [d, e] = decompose(s);
    return javaFmt(d, e, neg);
  };
  G.$ostr = function (v, kind) {
    if (v === null || v === undefined) return "null";
    switch (typeof v) {
      case "string": return v;
      case "number":
        if (kind === "F") return $fstr(v);
        if (kind === "D") return $dstr(v);
        if (kind === "C") return String.fromCharCode(v);
        return Number.isInteger(v) ? String(v) : $dstr(v);
      case "bigint": return v.toString();
      case "boolean": return v ? "true" : "false";
      default: return v.toString$();
    }
  };
  G.$sn = function (s) { return s === null || s === undefined ? "null" : s; };
  G.$ts = function (o) {
    if (o === null || o === undefined) throw new java_lang_NullPointerException().$init$();
    if (typeof o === "object" || typeof o === "function") return o.toString$();
    return $ostr(o);
  };

  // ------------------------------------------------------------------ identity / equality / hashing
  let hashSeq = 0x2a3b4c;
  const hashOf = new WeakMap();
  G.$idh = function (o) {
    if (o === null || o === undefined) return 0;
    let h = hashOf.get(o);
    if (h === undefined) { hashSeq = (Math.imul(hashSeq, 1103515245) + 12345) & 0x7fffffff; h = hashSeq; hashOf.set(o, h); }
    return h;
  };
  function strHash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0; return h; }
  G.$strHash = strHash;
  G.$eq = function (a, b) {
    if (a === null || a === undefined) throw new java_lang_NullPointerException().$init$();
    const t = typeof a;
    if (t === "string" || t === "number" || t === "bigint" || t === "boolean") return a === b;
    return a.equals$Object(b);
  };
  G.$hc = function (o) {
    if (o === null || o === undefined) throw new java_lang_NullPointerException().$init$();
    switch (typeof o) {
      case "string": return strHash(o);
      case "number":
        if (Number.isInteger(o) && o >= -2147483648 && o <= 2147483647) return o | 0;
        f64[0] = o; return i32x2[0] ^ i32x2[1];
      case "bigint": return Number(BigInt.asIntN(32, o ^ (BigInt.asUintN(64, o) >> 32n)));
      case "boolean": return o ? 1231 : 1237;
      default: return o.hashCode$();
    }
  };
  G.$cmp = function (a, b) {
    if (a === null || a === undefined) throw new java_lang_NullPointerException().$init$();
    switch (typeof a) {
      case "string": {
        const n = Math.min(a.length, b.length);
        for (let i = 0; i < n; i++) { const d = a.charCodeAt(i) - b.charCodeAt(i); if (d !== 0) return d; }
        return a.length - b.length;
      }
      case "number": case "bigint": return a < b ? -1 : a > b ? 1 : 0;
      case "boolean": return a === b ? 0 : (a ? 1 : -1);
      default: return a.compareTo$Object(b);
    }
  };

  // ------------------------------------------------------------------ interfaces / arrays / classes
  G.$isI = function (o, name) {
    if (o === null || o === undefined) return false;
    if (typeof o === "string") return name === "java_lang_CharSequence" || name === "java_lang_Comparable" || name === "java_io_Serializable";
    if (typeof o !== "object" && typeof o !== "function") return name === "java_lang_Comparable" || name === "java_io_Serializable";
    for (let c = o.constructor; c && c !== Object && c !== Function.prototype; c = Object.getPrototypeOf(c)) {
      const f = c.$ifaces;
      if (f && Object.prototype.hasOwnProperty.call(c, "$ifaces") && f.indexOf(name) >= 0) return true;
    }
    return false;
  };
  G.$wo = function (obj, outer) { obj.$outer = outer; return obj; };
  G.$isArr = function (v) { return Array.isArray(v) || ArrayBuffer.isView(v); };
  G.$newArr = function (n, kind) {
    if (n < 0) throw new java_lang_NegativeArraySizeException().$init$String(String(n));
    switch (kind) {
      case "I": return new Int32Array(n);
      case "F": return new Float32Array(n);
      case "D": return new Float64Array(n);
      case "J": return new BigInt64Array(n);
      case "B": return new Int8Array(n);
      case "S": return new Int16Array(n);
      case "C": return new Uint16Array(n);
      case "Z": return new Array(n).fill(false);
      default: return new Array(n).fill(null);
    }
  };
  G.$newMulti = function (dims, kind) {
    const n = dims[0];
    if (dims.length === 1) return $newArr(n, kind);
    if (n < 0) throw new java_lang_NegativeArraySizeException().$init$String(String(n));
    const out = new Array(n);
    const rest = dims.slice(1);
    for (let i = 0; i < n; i++) out[i] = $newMulti(rest, kind);
    return out;
  };

  // Class objects: translated classes are the JS constructors themselves; primitives / array classes are small objects.
  class $PrimClass { constructor(n) { this.$jname = n; this.$prim = true; } getName$() { return this.$jname; } getSimpleName$() { return this.$jname; } toString$() { return this.$jname; } hashCode$() { return $strHash(this.$jname); } equals$Object(o) { return this === o; } }
  const primCache = {};
  G.$prim = function (n) { return primCache[n] || (primCache[n] = new $PrimClass(n)); };
  G.$arrcls = function (sig) { return $prim("[" + sig); };
  const FP = Function.prototype;
  const defFn = (name, fn) => Object.defineProperty(FP, name, { value: fn, writable: true, configurable: true, enumerable: false });
  defFn("getName$", function () { return this.$jname || this.name; });
  defFn("getSimpleName$", function () { const n = this.$jname || this.name; return n.substring(Math.max(n.lastIndexOf("."), n.lastIndexOf("$")) + 1); });
  defFn("toString$", function () { return (this.$isIface ? "interface " : "class ") + (this.$jname || this.name); });
  defFn("hashCode$", function () { return $idh(this); });
  defFn("equals$Object", function (o) { return this === o; });
  defFn("newInstance$", function () { return new this().$init$(); });
  defFn("isAssignableFrom$Class", function (o) { return o === this || (typeof o === "function" && o.prototype instanceof this) || (this.$isIface && o && $isI(o.prototype, this.$jname.replace(/\./g, "_"))); });
  defFn("isInstance$Object", function (o) { return o instanceof this; });
  defFn("isInterface$", function () { return !!this.$isIface; });
  defFn("getSuperclass$", function () { const p = Object.getPrototypeOf(this); return p === FP ? null : p; });
  defFn("getEnumConstants$", function () { return this.values$(); });
  G.$gc = function (o) {
    if (o === null || o === undefined) throw new java_lang_NullPointerException().$init$();
    switch (typeof o) {
      case "string": return java_lang_String;
      case "number": return Number.isInteger(o) ? java_lang_Integer : java_lang_Double;
      case "bigint": return java_lang_Long;
      case "boolean": return java_lang_Boolean;
      default: return o.constructor;
    }
  };
  // array.clone()
  Array.prototype.clone$ = function () { return this.slice(); };
  for (const T of [Int8Array, Int16Array, Uint16Array, Int32Array, Float32Array, Float64Array, BigInt64Array]) T.prototype.clone$ = function () { return this.slice(); };

  // ------------------------------------------------------------------ java.lang.Object
  class java_lang_Object {
    $init$() { return this; }
    hashCode$() { return $idh(this); }
    equals$Object(o) { return this === o; }
    toString$() { return (this.constructor.$jname || this.constructor.name) + "@" + ($idh(this) >>> 0).toString(16); }
    getClass$() { return this.constructor; }
    clone$() {
      const c = Object.create(Object.getPrototypeOf(this));
      for (const k of Object.keys(this)) c[k] = this[k];
      return c;
    }
    notify$() { } notifyAll$() { } wait$() { } wait$J() { }
  }
  defClass(java_lang_Object, "java.lang.Object");
  defIface("java.io.Serializable"); defIface("java.lang.Cloneable"); defIface("java.lang.Runnable"); defIface("java.lang.Comparable");
  defIface("java.lang.CharSequence"); defIface("java.lang.Iterable");

  // ------------------------------------------------------------------ Throwable hierarchy
  class java_lang_Throwable extends java_lang_Object {
    constructor() { super(); this.$msg = null; this.$cause = null; if (G.$CAPTURE_STACKS !== false) this.$jsStack = new Error().stack; }
    $init$() { return this; }
    $init$String(m) { this.$msg = m; return this; }
    $init$String$Throwable(m, c) { this.$msg = m; this.$cause = c; return this; }
    $init$Throwable(c) { this.$cause = c; this.$msg = c === null ? null : c.toString$(); return this; }
    getMessage$() { return this.$msg; }
    getLocalizedMessage$() { return this.$msg; }
    getCause$() { return this.$cause; }
    initCause$Throwable(c) { this.$cause = c; return this; }
    toString$() { const n = this.constructor.$jname || this.constructor.name; return this.$msg !== null ? n + ": " + this.$msg : n; }
    printStackTrace$() { console.error(this.toString$() + (this.$jsStack ? "\n" + this.$jsStack : "")); if (this.$cause) console.error("Caused by: " + this.$cause.toString$()); }
    getStackTrace$() { return []; }
    setStackTrace$AStackTraceElement() { }
    addSuppressed$Throwable() { }
    fillInStackTrace$() { return this; }
  }
  defClass(java_lang_Throwable, "java.lang.Throwable", ["java_io_Serializable"]);
  function defEx(name, sup) {
    const simple = name.substring(name.lastIndexOf(".") + 1);
    const c = { [simple]: class extends sup { } }[simple];
    return defClass(c, name);
  }
  const Exc = defEx("java.lang.Exception", java_lang_Throwable);
  const Err = defEx("java.lang.Error", java_lang_Throwable);
  const RTE = defEx("java.lang.RuntimeException", Exc);
  defEx("java.lang.IllegalArgumentException", RTE); defEx("java.lang.IllegalStateException", RTE);
  defEx("java.lang.UnsupportedOperationException", RTE); defEx("java.lang.ArithmeticException", RTE);
  defEx("java.lang.NullPointerException", RTE); defEx("java.lang.ClassCastException", RTE);
  defEx("java.lang.NegativeArraySizeException", RTE); defEx("java.lang.ArrayStoreException", RTE);
  const IOOBE = defEx("java.lang.IndexOutOfBoundsException", RTE);
  defEx("java.lang.ArrayIndexOutOfBoundsException", IOOBE); defEx("java.lang.StringIndexOutOfBoundsException", IOOBE);
  defEx("java.lang.NumberFormatException", G.java_lang_IllegalArgumentException);
  defEx("java.util.NoSuchElementException", RTE); defEx("java.util.ConcurrentModificationException", RTE);
  defEx("java.lang.InterruptedException", Exc); defEx("java.lang.CloneNotSupportedException", Exc);
  const IOEx = defEx("java.io.IOException", Exc);
  defEx("java.io.UnsupportedEncodingException", IOEx); defEx("java.security.GeneralSecurityException", Exc);
  defEx("java.security.NoSuchAlgorithmException", G.java_security_GeneralSecurityException);
  defEx("java.lang.ReflectiveOperationException", Exc); defEx("java.lang.InstantiationException", G.java_lang_ReflectiveOperationException);
  defEx("java.lang.IllegalAccessException", G.java_lang_ReflectiveOperationException);
  defEx("java.lang.ClassNotFoundException", G.java_lang_ReflectiveOperationException);
  const VME = defEx("java.lang.VirtualMachineError", Err);
  defEx("java.lang.OutOfMemoryError", VME); defEx("java.lang.StackOverflowError", VME); defEx("java.lang.InternalError", VME);
  defEx("java.lang.AssertionError", Err);

  // JS error -> Java exception (used by every catch block of the generated code)
  G.$jex = function (e) {
    if (e instanceof java_lang_Throwable) return e;
    let j;
    if (e instanceof RangeError && /call stack|recursion/i.test(e.message)) j = new java_lang_StackOverflowError().$init$();
    else if (e instanceof RangeError && /array|allocation/i.test(e.message)) j = new java_lang_OutOfMemoryError().$init$String(e.message);
    else if (e instanceof TypeError) j = new java_lang_NullPointerException().$init$String(e.message);
    else j = new java_lang_RuntimeException().$init$String(String(e && e.message || e));
    j.$jsStack = e && e.stack;
    if (G.$jvmDebug) console.warn("[jex] JS error mapped to " + j.toString$() + "\n" + (e && e.stack));
    return j;
  };

  // ------------------------------------------------------------------ java.lang.Enum
  class java_lang_Enum extends java_lang_Object {
    constructor() { super(); this.$name = null; this.$ordinal = 0; }
    name$() { return this.$name; }
    ordinal$() { return this.$ordinal; }
    toString$() { return this.$name; }
    equals$Object(o) { return this === o; }
    hashCode$() { return $idh(this); }
    compareTo$Object(o) { return this.$ordinal - o.$ordinal; }
    compareTo$Enum(o) { return this.$ordinal - o.$ordinal; }
    getDeclaringClass$() { return this.constructor; }
    static $valueOf(values, s) {
      if (s === null) throw new java_lang_NullPointerException().$init$String("Name is null");
      for (const v of values) if (v.$name === s) return v;
      throw new java_lang_IllegalArgumentException().$init$String("No enum constant " + s);
    }
  }
  defClass(java_lang_Enum, "java.lang.Enum", ["java_lang_Comparable", "java_io_Serializable"]);

  // ------------------------------------------------------------------ System / Thread / Runtime / Math
  class java_io_PrintStream extends java_lang_Object {
    constructor() { super(); this.$fn = (s) => console.log(s); }
    println$String(s) { this.$fn(s); } println$() { this.$fn(""); } println$Object(o) { this.$fn($ostr(o)); }
    println$I(i) { this.$fn(String(i)); } print$String(s) { this.$fn(s); } flush$() { }
  }
  defClass(java_io_PrintStream, "java.io.PrintStream");
  class java_lang_System extends java_lang_Object {
    static currentTimeMillis$() { return BigInt(Date.now()); }
    static nanoTime$() { return BigInt(Math.round(performance.now() * 1e6)); }
    static gc$() { }
    static exit$I() { }
    static identityHashCode$Object(o) { return $idh(o); }
    static getProperty$String(k) { return null; }
    static lineSeparator$() { return "\n"; }
    static arraycopy$Object$I$Object$I$I(src, sp, dst, dp, n) {
      if (src === null || dst === null) throw new java_lang_NullPointerException().$init$();
      if (sp < 0 || dp < 0 || n < 0 || sp + n > src.length || dp + n > dst.length) throw new java_lang_ArrayIndexOutOfBoundsException().$init$String("arraycopy: length " + n + " out of bounds");
      if (ArrayBuffer.isView(src) && ArrayBuffer.isView(dst) && src.constructor === dst.constructor) { dst.set(src.subarray(sp, sp + n), dp); return; }
      if (src === dst && sp < dp) { for (let i = n - 1; i >= 0; i--) dst[dp + i] = src[sp + i]; }
      else for (let i = 0; i < n; i++) dst[dp + i] = src[sp + i];
    }
  }
  java_lang_System.S$out = new java_io_PrintStream();
  java_lang_System.S$err = (() => { const p = new java_io_PrintStream(); p.$fn = (s) => console.error(s); return p; })();
  java_lang_System.$ci = true;
  defClass(java_lang_System, "java.lang.System");

  class java_lang_Thread extends java_lang_Object {
    constructor() { super(); this.$name = "main"; }
    static sleep$J(ms) { }
    static currentThread$() { return java_lang_Thread.$main || (java_lang_Thread.$main = new java_lang_Thread()); }
    getId$() { return 1n; } getName$() { return this.$name; } setName$String(n) { this.$name = n; }
    isInterrupted$() { return false; } interrupt$() { } setPriority$I() { } setDaemon$Z() { }
  }
  defClass(java_lang_Thread, "java.lang.Thread", ["java_lang_Runnable"]);

  const MP = {
    abs$I: (i) => Math.abs(i) | 0,
    abs$J: (l) => l < 0n ? BigInt.asIntN(64, -l) : l,
    abs$F: Math.abs, abs$D: Math.abs,
    max$I$I: Math.max, min$I$I: Math.min, max$J$J: (a, b) => a > b ? a : b, min$J$J: (a, b) => a < b ? a : b,
    max$F$F: Math.max, min$F$F: Math.min, max$D$D: Math.max, min$D$D: Math.min,
    rint$D: (x) => { const f = Math.floor(x), d = x - f; return d < 0.5 ? f : d > 0.5 ? f + 1 : (f % 2 === 0 ? f : f + 1); },
    round$F: (x) => $d2i(Math.floor(x + 0.5)),
    round$D: (x) => $d2l(Math.floor(x + 0.5)),
    floor$D: Math.floor, ceil$D: Math.ceil, sqrt$D: Math.sqrt, sin$D: Math.sin, cos$D: Math.cos, tan$D: Math.tan,
    atan$D: Math.atan, atan2$D$D: Math.atan2, asin$D: Math.asin, acos$D: Math.acos, pow$D$D: Math.pow, exp$D: Math.exp, log$D: Math.log,
    log10$D: Math.log10, hypot$D$D: Math.hypot, cbrt$D: Math.cbrt, signum$D: Math.sign, signum$F: Math.sign,
    toRadians$D: $toRadians, toDegrees$D: $toDegrees, random$: Math.random,
  };
  class java_lang_Math extends java_lang_Object { }
  class java_lang_StrictMath extends java_lang_Object { }
  Object.assign(java_lang_Math, MP, { S$PI: Math.PI, S$E: Math.E });
  Object.assign(java_lang_StrictMath, MP, { S$PI: Math.PI, S$E: Math.E });
  defClass(java_lang_Math, "java.lang.Math"); defClass(java_lang_StrictMath, "java.lang.StrictMath");

  // ------------------------------------------------------------------ boxed types + String
  const utf8enc = new TextEncoder();
  function toBytes(s) { return new Int8Array(utf8enc.encode(s).buffer.slice(0)); }
  class java_lang_Number extends java_lang_Object { }
  defClass(java_lang_Number, "java.lang.Number");
  function nfe(s) { return new java_lang_NumberFormatException().$init$String(s === null ? "null" : 'For input string: "' + s + '"'); }
  class java_lang_Integer extends java_lang_Number {
    static valueOf$I(i) { return i; }
    static valueOf$String(s) { return java_lang_Integer.parseInt$String(s); }
    static parseInt$String(s) { return java_lang_Integer.parseInt$String$I(s, 10); }
    static parseInt$String$I(s, radix) {
      if (s === null) throw nfe(null);
      const t = s.trim() === s ? s : null;
      if (t === null || !/^[+-]?[0-9a-zA-Z]+$/.test(t)) throw nfe(s);
      const v = parseInt(t, radix);
      if (v !== v || v > 2147483647 || v < -2147483648 || (radix === 10 && !/^[+-]?\d+$/.test(t))) throw nfe(s);
      return v;
    }
    static toString$I(i) { return String(i); }
    static toString$I$I(i, r) { return i.toString(r); }
    static toHexString$I(i) { return (i >>> 0).toString(16); }
    static toBinaryString$I(i) { return (i >>> 0).toString(2); }
    static compare$I$I(a, b) { return a < b ? -1 : a > b ? 1 : 0; }
    static signum$I(i) { return i < 0 ? -1 : i > 0 ? 1 : 0; }
    static bitCount$I(i) { i = i - ((i >>> 1) & 0x55555555); i = (i & 0x33333333) + ((i >>> 2) & 0x33333333); return (Math.imul((i + (i >>> 4)) & 0x0f0f0f0f, 0x01010101) >>> 24); }
    static highestOneBit$I(i) { return i === 0 ? 0 : (0x80000000 >>> Math.clz32(i)) | 0; }
    static numberOfLeadingZeros$I(i) { return Math.clz32(i); }
    static numberOfTrailingZeros$I(i) { return i === 0 ? 32 : 31 - Math.clz32(i & -i); }
    static hashCode$I(i) { return i; }
    static $new$I(i) { return i; } static $new$String(s) { return java_lang_Integer.parseInt$String(s); }
  }
  defClass(java_lang_Integer, "java.lang.Integer", ["java_lang_Comparable"]);
  class java_lang_Short extends java_lang_Number { static valueOf$S(i) { return i; } static parseShort$String(s) { return java_lang_Integer.parseInt$String(s); } static toString$S(i) { return String(i); } }
  class java_lang_Byte extends java_lang_Number { static valueOf$B(i) { return i; } static parseByte$String(s) { return java_lang_Integer.parseInt$String(s); } static toString$B(i) { return String(i); } }
  defClass(java_lang_Short, "java.lang.Short"); defClass(java_lang_Byte, "java.lang.Byte");
  class java_lang_Long extends java_lang_Number {
    static valueOf$J(l) { return l; }
    static valueOf$String(s) { return java_lang_Long.parseLong$String(s); }
    static parseLong$String(s) { if (s === null || !/^[+-]?\d+$/.test(s)) throw nfe(s); const v = BigInt(s); if (v > MAXL || v < MINL) throw nfe(s); return v; }
    static toString$J(l) { return l.toString(); }
    static toHexString$J(l) { return BigInt.asUintN(64, l).toString(16); }
    static compare$J$J(a, b) { return a < b ? -1 : a > b ? 1 : 0; }
    static hashCode$J(l) { return $hc(l); }
    static $new$J(l) { return l; }
  }
  defClass(java_lang_Long, "java.lang.Long", ["java_lang_Comparable"]);
  class java_lang_Float extends java_lang_Number {
    static valueOf$F(f) { return f; }
    static valueOf$String(s) { return java_lang_Float.parseFloat$String(s); }
    static parseFloat$String(s) { if (s === null) throw new java_lang_NullPointerException().$init$(); const t = s.trim(); if (!/^[+-]?(NaN|Infinity|((\d+\.?\d*|\.\d+)([eE][+-]?\d+)?)[fFdD]?)$/.test(t)) throw nfe(s); return Math.fround(parseFloat(t)); }
    static toString$F(f) { return $fstr(f); }
    static compare$F$F(a, b) { return a < b ? -1 : a > b ? 1 : (a === b ? (a === 0 ? (1 / a === 1 / b ? 0 : (1 / a < 0 ? -1 : 1)) : 0) : (a !== a ? (b !== b ? 0 : 1) : -1)); }
    static floatToIntBits$F(f) { f32[0] = f; return (f !== f) ? 0x7fc00000 : i32[0]; }
    static floatToRawIntBits$F(f) { f32[0] = f; return i32[0]; }
    static intBitsToFloat$I(i) { i32[0] = i; return f32[0]; }
    static isNaN$F(f) { return f !== f; }
    static isInfinite$F(f) { return f === Infinity || f === -Infinity; }
    static hashCode$F(f) { return java_lang_Float.floatToIntBits$F(f); }
    static $new$F(f) { return f; }
  }
  defClass(java_lang_Float, "java.lang.Float", ["java_lang_Comparable"]);
  class java_lang_Double extends java_lang_Number {
    static valueOf$D(d) { return d; }
    static valueOf$String(s) { return java_lang_Double.parseDouble$String(s); }
    static parseDouble$String(s) { if (s === null) throw new java_lang_NullPointerException().$init$(); const t = s.trim(); if (!/^[+-]?(NaN|Infinity|((\d+\.?\d*|\.\d+)([eE][+-]?\d+)?)[fFdD]?)$/.test(t)) throw nfe(s); return parseFloat(t); }
    static toString$D(d) { return $dstr(d); }
    static compare$D$D(a, b) { return java_lang_Float.compare$F$F(a, b); }
    static doubleToLongBits$D(d) { f64[0] = d; return d !== d ? 0x7ff8000000000000n : i64[0]; }
    static doubleToRawLongBits$D(d) { f64[0] = d; return i64[0]; }
    static longBitsToDouble$J(l) { i64[0] = l; return f64[0]; }
    static isNaN$D(d) { return d !== d; }
    static isInfinite$D(d) { return d === Infinity || d === -Infinity; }
    static hashCode$D(d) { return $hc(d); }
    static $new$D(d) { return d; }
  }
  defClass(java_lang_Double, "java.lang.Double", ["java_lang_Comparable"]);
  class java_lang_Boolean extends java_lang_Object {
    static valueOf$Z(b) { return b; }
    static valueOf$String(s) { return java_lang_Boolean.parseBoolean$String(s); }
    static parseBoolean$String(s) { return s !== null && s.toLowerCase() === "true"; }
    static toString$Z(b) { return b ? "true" : "false"; }
    static compare$Z$Z(a, b) { return a === b ? 0 : (a ? 1 : -1); }
    static hashCode$Z(b) { return b ? 1231 : 1237; }
    static $new$Z(b) { return b; }
  }
  java_lang_Boolean.S$TRUE = true; java_lang_Boolean.S$FALSE = false;
  defClass(java_lang_Boolean, "java.lang.Boolean", ["java_lang_Comparable"]);
  class java_lang_Character extends java_lang_Object {
    static valueOf$C(c) { return c; }
    static toString$C(c) { return String.fromCharCode(c); }
    static isDigit$C(c) { return c >= 48 && c <= 57; }
    static isLetter$C(c) { return /\p{L}/u.test(String.fromCharCode(c)); }
    static isLetterOrDigit$C(c) { return /[\p{L}\p{Nd}]/u.test(String.fromCharCode(c)); }
    static isUpperCase$C(c) { const s = String.fromCharCode(c); return s !== s.toLowerCase(); }
    static isLowerCase$C(c) { const s = String.fromCharCode(c); return s !== s.toUpperCase(); }
    static isWhitespace$C(c) { return /\s/.test(String.fromCharCode(c)); }
    static toUpperCase$C(c) { return String.fromCharCode(c).toUpperCase().charCodeAt(0); }
    static toLowerCase$C(c) { return String.fromCharCode(c).toLowerCase().charCodeAt(0); }
    static digit$C$I(c, r) { const v = parseInt(String.fromCharCode(c), r); return v !== v ? -1 : v; }
    static getNumericValue$C(c) { const v = parseInt(String.fromCharCode(c), 36); return v !== v ? -1 : v; }
    static compare$C$C(a, b) { return a - b; }
  }
  defClass(java_lang_Character, "java.lang.Character", ["java_lang_Comparable"]);

  // Instance methods of String / boxed values are called as $S.name(recv, ...) / $N.name(recv, ...)
  const NPEchk = (s) => { if (s === null || s === undefined) throw new java_lang_NullPointerException().$init$(); return s; };
  function sidx(s, i) { return new java_lang_StringIndexOutOfBoundsException().$init$String("index " + i + ", length " + s.length); }
  G.$S = {
    length$: (s) => NPEchk(s).length,
    charAt$I: (s, i) => { NPEchk(s); if (i < 0 || i >= s.length) throw sidx(s, i); return s.charCodeAt(i); },
    isEmpty$: (s) => NPEchk(s).length === 0,
    trim$: (s) => NPEchk(s).replace(/^[\x00-\x20]+|[\x00-\x20]+$/g, ""),
    toString$: (s) => NPEchk(s),
    substring$I: (s, a) => { NPEchk(s); if (a < 0 || a > s.length) throw sidx(s, a); return s.substring(a); },
    substring$I$I: (s, a, b) => { NPEchk(s); if (a < 0 || b > s.length || a > b) throw sidx(s, a); return s.substring(a, b); },
    indexOf$String: (s, t) => NPEchk(s).indexOf(t), indexOf$I: (s, c) => NPEchk(s).indexOf(String.fromCharCode(c)),
    indexOf$String$I: (s, t, i) => NPEchk(s).indexOf(t, i), indexOf$I$I: (s, c, i) => NPEchk(s).indexOf(String.fromCharCode(c), i),
    lastIndexOf$String: (s, t) => NPEchk(s).lastIndexOf(t), lastIndexOf$I: (s, c) => NPEchk(s).lastIndexOf(String.fromCharCode(c)),
    contains$CharSequence: (s, t) => NPEchk(s).includes(t.toString$ ? t.toString$() : t),
    startsWith$String: (s, t) => NPEchk(s).startsWith(t), startsWith$String$I: (s, t, i) => NPEchk(s).startsWith(t, i),
    endsWith$String: (s, t) => NPEchk(s).endsWith(t),
    equalsIgnoreCase$String: (s, t) => t !== null && NPEchk(s).toLowerCase() === t.toLowerCase(),
    compareTo$String: (s, t) => $cmp(s, t), compareToIgnoreCase$String: (s, t) => $cmp(s.toLowerCase(), t.toLowerCase()),
    concat$String: (s, t) => NPEchk(s) + t,
    replace$C$C: (s, a, b) => NPEchk(s).split(String.fromCharCode(a)).join(String.fromCharCode(b)),
    replace$CharSequence$CharSequence: (s, a, b) => NPEchk(s).split(String(a)).join(String(b)),
    replaceAll$String$String: (s, re, rep) => NPEchk(s).replace(new RegExp(re, "g"), rep.replace(/\$(\d)/g, "$$$1")),
    replaceFirst$String$String: (s, re, rep) => NPEchk(s).replace(new RegExp(re), rep),
    matches$String: (s, re) => new RegExp("^(?:" + re + ")$").test(NPEchk(s)),
    split$String: (s, re) => { let p = NPEchk(s).split(new RegExp(re)); while (p.length > 1 && p[p.length - 1] === "") p.pop(); if (s === "") p = [""]; return p; },
    split$String$I: (s, re, lim) => lim > 0 ? (() => { const out = []; let rest = s; const rx = new RegExp(re); while (out.length < lim - 1) { const m = rx.exec(rest); if (!m || m[0].length === 0 && m.index >= rest.length) break; out.push(rest.slice(0, m.index)); rest = rest.slice(m.index + m[0].length); } out.push(rest); return out; })() : NPEchk(s).split(new RegExp(re)),
    toLowerCase$: (s) => NPEchk(s).toLowerCase(), toUpperCase$: (s) => NPEchk(s).toUpperCase(),
    toLowerCase$Locale: (s) => NPEchk(s).toLowerCase(), toUpperCase$Locale: (s) => NPEchk(s).toUpperCase(),
    toCharArray$: (s) => { NPEchk(s); const a = new Uint16Array(s.length); for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; },
    getBytes$: (s) => toBytes(NPEchk(s)),
    getBytes$String: (s, cs) => { if (!/^utf-?8$/i.test(cs)) throw new java_io_UnsupportedEncodingException().$init$String(cs); return toBytes(NPEchk(s)); },
    intern$: (s) => s, hashCode$: (s) => strHash(NPEchk(s)),
    format$String$AObject: (s, a) => java_lang_String.format$String$AObject(s, a),
  };
  class java_lang_String extends java_lang_Object {
    static valueOf$C(c) { return String.fromCharCode(c); }
    static valueOf$Object(o) { return $ostr(o); }
    static valueOf$Z(b) { return b ? "true" : "false"; }
    static valueOf$I(i) { return String(i); } static valueOf$J(l) { return l.toString(); }
    static valueOf$F(f) { return $fstr(f); } static valueOf$D(d) { return $dstr(d); }
    static valueOf$AC(a) { return String.fromCharCode.apply(null, a); }
    static copyValueOf$AC(a) { return String.fromCharCode.apply(null, a); }
    static $new$() { return ""; }
    static $new$String(s) { return s; }
    static $new$StringBuffer(sb) { return sb.toString$(); } static $new$StringBuilder(sb) { return sb.toString$(); }
    static $new$AC(a) { return String.fromCharCode.apply(null, a); }
    static $new$AB(b) { return new TextDecoder("utf-8").decode(new Uint8Array(b.buffer, b.byteOffset, b.length)); }
    static $new$AB$String(b, cs) { return java_lang_String.$new$AB(b); }
    static $new$AB$I$I(b, o, n) { return java_lang_String.$new$AB(b.subarray(o, o + n)); }
    static format$String$AObject(fmt, args) {
      let ai = 0;
      return fmt.replace(/%(\d+\$)?([-+ 0,#]*)(\d+)?(?:\.(\d+))?([sdfxXcbn%eEgG])/g, (m, pos, flags, width, prec, conv) => {
        if (conv === "%") return "%"; if (conv === "n") return "\n";
        const arg = pos ? args[parseInt(pos, 10) - 1] : args[ai++];
        let s;
        switch (conv) {
          case "d": s = typeof arg === "bigint" ? arg.toString() : String(arg); if (flags.includes(",")) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ","); if (flags.includes("+") && arg >= 0) s = "+" + s; break;
          case "f": s = Number(arg).toFixed(prec === undefined ? 6 : parseInt(prec, 10)); if (flags.includes(",")) { const [i, f] = s.split("."); s = i.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (f ? "." + f : ""); } break;
          case "e": case "E": s = Number(arg).toExponential(prec === undefined ? 6 : parseInt(prec, 10)); break;
          case "x": s = (arg >>> 0).toString(16); break; case "X": s = (arg >>> 0).toString(16).toUpperCase(); break;
          case "c": s = typeof arg === "number" ? String.fromCharCode(arg) : String(arg); break;
          case "b": s = String(!!arg); break;
          default: s = $ostr(arg); if (prec !== undefined) s = s.substring(0, parseInt(prec, 10));
        }
        if (width !== undefined) { const w = parseInt(width, 10); if (s.length < w) s = flags.includes("-") ? s + " ".repeat(w - s.length) : (flags.includes("0") && conv !== "s" ? "0".repeat(w - s.length) : " ".repeat(w - s.length)) + s; }
        return s;
      });
    }
    static format$Locale$String$AObject(l, f, a) { return java_lang_String.format$String$AObject(f, a); }
    static join$CharSequence$AObject(sep, parts) { return Array.from(parts, (x) => $ostr(x)).join(sep); }
  }
  defClass(java_lang_String, "java.lang.String", ["java_lang_CharSequence", "java_lang_Comparable", "java_io_Serializable"]);
  G.$N = {
    intValue$: (n) => $d2i(NPEchk(n)), longValue$: (n) => typeof n === "bigint" ? n : $d2l(NPEchk(n)),
    floatValue$: (n) => Math.fround(Number(NPEchk(n))), doubleValue$: (n) => Number(NPEchk(n)),
    shortValue$: (n) => (NPEchk(n) << 16) >> 16, byteValue$: (n) => (NPEchk(n) << 24) >> 24,
    booleanValue$: (b) => NPEchk(b), charValue$: (c) => NPEchk(c),
    isNaN$: (n) => n !== n, isInfinite$: (n) => n === Infinity || n === -Infinity,
  };

  // ------------------------------------------------------------------ StringBuilder / StringBuffer
  class java_lang_StringBuilder extends java_lang_Object {
    constructor() { super(); this.s = ""; }
    $init$() { return this; } $init$I() { return this; }
    $init$String(s) { this.s = s; return this; } $init$CharSequence(s) { this.s = $ostr(s); return this; }
    append$String(x) { this.s += x === null ? "null" : x; return this; }
    append$Object(x) { this.s += $ostr(x); return this; }
    append$CharSequence(x) { this.s += $ostr(x); return this; }
    append$C(c) { this.s += String.fromCharCode(c); return this; }
    append$I(i) { this.s += i; return this; } append$J(l) { this.s += l.toString(); return this; }
    append$Z(b) { this.s += b ? "true" : "false"; return this; }
    append$F(f) { this.s += $fstr(f); return this; } append$D(d) { this.s += $dstr(d); return this; }
    append$AC(a) { this.s += String.fromCharCode.apply(null, a); return this; }
    append$StringBuffer(x) { this.s += x.s; return this; }
    insert$I$String(i, x) { this.s = this.s.slice(0, i) + x + this.s.slice(i); return this; }
    insert$I$C(i, c) { return this.insert$I$String(i, String.fromCharCode(c)); }
    insert$I$Object(i, x) { return this.insert$I$String(i, $ostr(x)); }
    length$() { return this.s.length; } charAt$I(i) { if (i < 0 || i >= this.s.length) throw sidx(this.s, i); return this.s.charCodeAt(i); }
    setLength$I(n) { this.s = n <= this.s.length ? this.s.slice(0, n) : this.s + "\0".repeat(n - this.s.length); }
    setCharAt$I$C(i, c) { this.s = this.s.slice(0, i) + String.fromCharCode(c) + this.s.slice(i + 1); }
    deleteCharAt$I(i) { this.s = this.s.slice(0, i) + this.s.slice(i + 1); return this; }
    delete$I$I(a, b) { this.s = this.s.slice(0, a) + this.s.slice(b); return this; }
    replace$I$I$String(a, b, x) { this.s = this.s.slice(0, a) + x + this.s.slice(b); return this; }
    reverse$() { this.s = Array.from(this.s).reverse().join(""); return this; }
    indexOf$String(x) { return this.s.indexOf(x); } substring$I(a) { return this.s.substring(a); } substring$I$I(a, b) { return this.s.substring(a, b); }
    capacity$() { return Math.max(16, this.s.length); } ensureCapacity$I() { }
    toString$() { return this.s; }
  }
  defClass(java_lang_StringBuilder, "java.lang.StringBuilder", ["java_lang_CharSequence"]);
  class java_lang_StringBuffer extends java_lang_StringBuilder { }
  defClass(java_lang_StringBuffer, "java.lang.StringBuffer", ["java_lang_CharSequence"]);

  // reflect.Array
  class java_lang_reflect_Array extends java_lang_Object {
    static newInstance$Class$I(cls, n) {
      if (cls && cls.$prim) { const k = { int: "I", float: "F", double: "D", long: "J", byte: "B", short: "S", char: "C", boolean: "Z" }[cls.$jname]; return $newArr(n, k); }
      return $newArr(n, "L");
    }
    static newInstance$Class$AI(cls, dims) {
      const d = Array.from(dims);
      const k = cls && cls.$prim ? { int: "I", float: "F", double: "D", long: "J", byte: "B", short: "S", char: "C", boolean: "Z" }[cls.$jname] : "L";
      return $newMulti(d, k);
    }
    static getLength$Object(a) { return a.length; }
  }
  defClass(java_lang_reflect_Array, "java.lang.reflect.Array");

  defClass(class java_io_ObjectInputStream extends java_lang_Object { defaultReadObject$() { } }, "java.io.ObjectInputStream");
  defClass(class java_io_ObjectOutputStream extends java_lang_Object { defaultWriteObject$() { } }, "java.io.ObjectOutputStream");
  defClass(class java_lang_Runtime extends java_lang_Object {
    static getRuntime$() { return java_lang_Runtime.$r || (java_lang_Runtime.$r = new java_lang_Runtime()); }
    totalMemory$() { return 268435456n; } freeMemory$() { return 134217728n; } maxMemory$() { return 536870912n; } gc$() { }
  }, "java.lang.Runtime");
})(globalThis);
