// Air Attack web port - Java runtime subset, part 2: java.util / java.text / java.security
(function (G) {
  "use strict";
  const defClass = G.$defClass, defIface = G.$defIface;

  defIface("java.util.Iterator");
  defIface("java.util.ListIterator", ["java_util_Iterator"]);
  defIface("java.util.Collection", ["java_lang_Iterable"]);
  defIface("java.util.List", ["java_util_Collection", "java_lang_Iterable"]);
  defIface("java.util.Set", ["java_util_Collection", "java_lang_Iterable"]);
  defIface("java.util.Map");
  defIface("java.util.Map$Entry");
  defIface("java.util.Comparator");
  defIface("java.util.RandomAccess");

  const ioobe = (i, n) => new java_lang_IndexOutOfBoundsException().$init$String("Index: " + i + ", Size: " + n);

  // ------------------------------------------------------------------ iterators
  class ArrayIter extends java_lang_Object {
    constructor(list) { super(); this.l = list; this.i = 0; this.last = -1; }
    hasNext$() { return this.i < this.l.a.length; }
    next$() { if (this.i >= this.l.a.length) throw new java_util_NoSuchElementException().$init$(); this.last = this.i; return this.l.a[this.i++]; }
    remove$() { if (this.last < 0) throw new java_lang_IllegalStateException().$init$(); this.l.a.splice(this.last, 1); this.i = this.last; this.last = -1; }
  }
  defClass(ArrayIter, "java.util.ArrayList$Itr", ["java_util_Iterator"]);
  class JsIter extends java_lang_Object {
    constructor(jsIterator, remover) { super(); this.it = jsIterator; this.n = this.it.next(); this.rm = remover; this.cur = null; }
    hasNext$() { return !this.n.done; }
    next$() { if (this.n.done) throw new java_util_NoSuchElementException().$init$(); this.cur = this.n.value; this.n = this.it.next(); return this.cur; }
    remove$() { if (this.rm) this.rm(this.cur); }
  }
  defClass(JsIter, "java.util.Iter", ["java_util_Iterator"]);

  // ------------------------------------------------------------------ AbstractCollection helpers shared by list/set
  class java_util_AbstractCollection extends java_lang_Object {
    isEmpty$() { return this.size$() === 0; }
    contains$Object(o) { return this.indexOfObj(o) >= 0; }
    toString$() { const p = []; for (const it = this.iterator$(); it.hasNext$();) { const x = it.next$(); p.push(x === this ? "(this Collection)" : $ostr(x)); } return "[" + p.join(", ") + "]"; }
    containsAll$Collection(c) { for (const it = c.iterator$(); it.hasNext$();) if (!this.contains$Object(it.next$())) return false; return true; }
    addAll$Collection(c) { let ch = false; for (const it = c.iterator$(); it.hasNext$();) if (this.add$Object(it.next$())) ch = true; return ch; }
    toArray$() { const out = []; for (const it = this.iterator$(); it.hasNext$();) out.push(it.next$()); return out; }
    toArray$AObject(a) { return this.toArray$(); }
  }
  defClass(java_util_AbstractCollection, "java.util.AbstractCollection", ["java_util_Collection"]);

  // ------------------------------------------------------------------ ArrayList
  class java_util_ArrayList extends java_util_AbstractCollection {
    constructor() { super(); this.a = []; }
    $init$() { return this; } $init$I(n) { if (n < 0) throw new java_lang_IllegalArgumentException().$init$String("Illegal Capacity: " + n); return this; }
    $init$Collection(c) { this.a = c.toArray$().slice(); return this; }
    size$() { return this.a.length; }
    isEmpty$() { return this.a.length === 0; }
    get$I(i) { const a = this.a; if (i < 0 || i >= a.length) throw ioobe(i, a.length); return a[i]; }
    set$I$Object(i, v) { const a = this.a; if (i < 0 || i >= a.length) throw ioobe(i, a.length); const o = a[i]; a[i] = v; return o; }
    add$Object(v) { this.a.push(v); return true; }
    add$I$Object(i, v) { if (i < 0 || i > this.a.length) throw ioobe(i, this.a.length); this.a.splice(i, 0, v); }
    addAll$Collection(c) { const x = c.toArray$(); for (let i = 0; i < x.length; i++) this.a.push(x[i]); return x.length > 0; }
    addAll$I$Collection(i, c) { this.a.splice(i, 0, ...c.toArray$()); return true; }
    clear$() { this.a.length = 0; }
    remove$I(i) { const a = this.a; if (i < 0 || i >= a.length) throw ioobe(i, a.length); return a.splice(i, 1)[0]; }
    indexOfObj(o) { const a = this.a; if (o === null) return a.indexOf(null); for (let i = 0; i < a.length; i++) { const x = a[i]; if (x === o || (x !== null && $eq(o, x))) return i; } return -1; }
    indexOf$Object(o) { return this.indexOfObj(o); }
    lastIndexOf$Object(o) { const a = this.a; for (let i = a.length - 1; i >= 0; i--) { const x = a[i]; if (x === o || (o !== null && x !== null && $eq(o, x))) return i; } return -1; }
    remove$Object(o) { const i = this.indexOfObj(o); if (i < 0) return false; this.a.splice(i, 1); return true; }
    removeAll$Collection(c) { const b = this.a.length; this.a = this.a.filter((x) => !c.contains$Object(x)); return this.a.length !== b; }
    retainAll$Collection(c) { const b = this.a.length; this.a = this.a.filter((x) => c.contains$Object(x)); return this.a.length !== b; }
    iterator$() { return new ArrayIter(this); }
    listIterator$() { return new ArrayIter(this); }
    toArray$() { return this.a.slice(); }
    toArray$AObject() { return this.a.slice(); }
    subList$I$I(f, t) { const l = new java_util_ArrayList(); l.a = this.a.slice(f, t); return l; }
    sort$Comparator(c) { java_util_Collections.sort$List$Comparator(this, c); }
    ensureCapacity$I() { } trimToSize$() { }
    equals$Object(o) { if (o === this) return true; if (!$isI(o, "java_util_List")) return false; const b = o.toArray$(); if (b.length !== this.a.length) return false; for (let i = 0; i < b.length; i++) { const x = this.a[i], y = b[i]; if (!(x === y || (x !== null && y !== null && $eq(x, y)))) return false; } return true; }
    hashCode$() { let h = 1; for (const x of this.a) h = (Math.imul(31, h) + (x === null ? 0 : $hc(x))) | 0; return h; }
    clone$() { const l = new java_util_ArrayList(); l.a = this.a.slice(); return l; }
    removeRange$I$I(f, t) { this.a.splice(f, t - f); }
  }
  defClass(java_util_ArrayList, "java.util.ArrayList", ["java_util_List", "java_util_RandomAccess", "java_lang_Cloneable", "java_io_Serializable"]);
  class java_util_LinkedList extends java_util_ArrayList {
    addFirst$Object(o) { this.a.unshift(o); } addLast$Object(o) { this.a.push(o); }
    removeFirst$() { if (!this.a.length) throw new java_util_NoSuchElementException().$init$(); return this.a.shift(); }
    removeLast$() { if (!this.a.length) throw new java_util_NoSuchElementException().$init$(); return this.a.pop(); }
    getFirst$() { if (!this.a.length) throw new java_util_NoSuchElementException().$init$(); return this.a[0]; }
    getLast$() { if (!this.a.length) throw new java_util_NoSuchElementException().$init$(); return this.a[this.a.length - 1]; }
    peek$() { return this.a.length ? this.a[0] : null; } poll$() { return this.a.length ? this.a.shift() : null; }
    offer$Object(o) { this.a.push(o); return true; } push$Object(o) { this.a.unshift(o); } pop$() { return this.removeFirst$(); }
  }
  defClass(java_util_LinkedList, "java.util.LinkedList", ["java_util_List"]);
  class java_util_Vector extends java_util_ArrayList { }
  defClass(java_util_Vector, "java.util.Vector", ["java_util_List"]);

  // ------------------------------------------------------------------ HashMap (insertion-ordered; see README "known deviations")
  function nkey(k) {
    switch (typeof k) {
      case "string": return "s" + k;
      case "number": return Number.isInteger(k) ? k : "d" + k;
      case "bigint": return "L" + k;
      case "boolean": return k;
      case "function": return k;                      // Class objects
      default:
        if (k === null) return null;
        if (k.hashCode$ === java_lang_Object.prototype.hashCode$) return k; // identity semantics
        return "h" + k.hashCode$();
    }
  }
  class Node extends java_lang_Object {
    constructor(k, v) { super(); this.k = k; this.v = v; this.nx = null; }
    getKey$() { return this.k; } getValue$() { return this.v; }
    setValue$Object(v) { const o = this.v; this.v = v; return o; }
    toString$() { return $ostr(this.k) + "=" + $ostr(this.v); }
    equals$Object(o) { return o instanceof Node && $eqn(this.k, o.k) && $eqn(this.v, o.v); }
    hashCode$() { return (this.k === null ? 0 : $hc(this.k)) ^ (this.v === null ? 0 : $hc(this.v)); }
  }
  defClass(Node, "java.util.HashMap$Node", ["java_util_Map$Entry"]);
  const $eqn = (a, b) => a === b || (a !== null && b !== null && $eq(a, b));

  class java_util_AbstractMap extends java_lang_Object { }
  defClass(java_util_AbstractMap, "java.util.AbstractMap", ["java_util_Map"]);
  class java_util_HashMap extends java_util_AbstractMap {
    constructor() { super(); this.m = new Map(); this.n = 0; }
    $init$() { return this; } $init$I() { return this; } $init$I$F() { return this; }
    $init$Map(o) { this.putAll$Map(o); return this; }
    $find(k) {
      let e = this.m.get(nkey(k));
      if (e === undefined) return null;
      if (typeof k === "object" && k !== null && k.hashCode$ !== java_lang_Object.prototype.hashCode$) {
        for (; e !== null; e = e.nx) { if ($eqn(e.k, k)) return e; }
        return null;
      }
      return e;
    }
    size$() { return this.n; } isEmpty$() { return this.n === 0; }
    get$Object(k) { const e = this.$find(k); return e === null ? null : e.v; }
    containsKey$Object(k) { return this.$find(k) !== null; }
    getOrDefault$Object$Object(k, d) { const e = this.$find(k); return e === null ? d : e.v; }
    put$Object$Object(k, v) {
      const nk = nkey(k);
      let head = this.m.get(nk);
      if (head === undefined) { this.m.set(nk, new Node(k, v)); this.n++; return null; }
      if (typeof k === "object" && k !== null && k.hashCode$ !== java_lang_Object.prototype.hashCode$) {
        let e = head, last = null;
        for (; e !== null; e = e.nx) { if ($eqn(e.k, k)) { const o = e.v; e.v = v; return o; } last = e; }
        last.nx = new Node(k, v); this.n++; return null;
      }
      const o = head.v; head.v = v; return o;
    }
    putAll$Map(o) { for (const it = o.entrySet$().iterator$(); it.hasNext$();) { const e = it.next$(); this.put$Object$Object(e.getKey$(), e.getValue$()); } }
    remove$Object(k) {
      const nk = nkey(k); let head = this.m.get(nk);
      if (head === undefined) return null;
      if (typeof k === "object" && k !== null && k.hashCode$ !== java_lang_Object.prototype.hashCode$) {
        let prev = null;
        for (let e = head; e !== null; prev = e, e = e.nx) if ($eqn(e.k, k)) {
          if (prev === null) { if (e.nx === null) this.m.delete(nk); else this.m.set(nk, e.nx); } else prev.nx = e.nx;
          this.n--; return e.v;
        }
        return null;
      }
      this.m.delete(nk); this.n--; return head.v;
    }
    clear$() { this.m.clear(); this.n = 0; }
    $nodes() { const out = []; for (let e of this.m.values()) for (; e !== null; e = e.nx) out.push(e); return out; }
    containsValue$Object(v) { return this.$nodes().some((e) => $eqn(v, e.v)); }
    entrySet$() { return new MapView(this, 0); }
    keySet$() { return new MapView(this, 1); }
    values$() { return new MapView(this, 2); }
    toString$() { return "{" + this.$nodes().map((e) => $ostr(e.k) + "=" + $ostr(e.v)).join(", ") + "}"; }
    equals$Object(o) { return o === this; }
    hashCode$() { return $idh(this); }
  }
  // Maps that hash objects by equals/hashCode keep identity semantics in $hashSeed above; override for objects with hashCode$
  defClass(java_util_HashMap, "java.util.HashMap", ["java_util_Map", "java_lang_Cloneable", "java_io_Serializable"]);
  class java_util_LinkedHashMap extends java_util_HashMap { }
  defClass(java_util_LinkedHashMap, "java.util.LinkedHashMap", ["java_util_Map"]);
  class java_util_TreeMap extends java_util_HashMap {
    $nodes() { return super.$nodes().sort((a, b) => $cmp(a.k, b.k)); }
  }
  defClass(java_util_TreeMap, "java.util.TreeMap", ["java_util_Map"]);
  class java_util_Hashtable extends java_util_HashMap { }
  defClass(java_util_Hashtable, "java.util.Hashtable", ["java_util_Map"]);

  class MapView extends java_util_AbstractCollection {
    constructor(map, kind) { super(); this.map = map; this.kind = kind; }
    size$() { return this.map.n; }
    toArray$() { return this.map.$nodes().map((e) => this.kind === 0 ? e : this.kind === 1 ? e.k : e.v); }
    iterator$() {
      const kind = this.kind, map = this.map, nodes = map.$nodes();
      const base = new JsIter(nodes.values(), (n) => map.remove$Object(n.k));
      const next = base.next$.bind(base);
      base.next$ = () => { const e = next(); return kind === 0 ? e : kind === 1 ? e.k : e.v; };
      base.remove$ = () => { map.remove$Object(base.cur.k); };
      return base;
    }
    indexOfObj(o) { return this.toArray$().findIndex((x) => $eqn(o, x)); }
    contains$Object(o) { if (this.kind === 1) return this.map.containsKey$Object(o); return this.indexOfObj(o) >= 0; }
    remove$Object(o) { if (this.kind === 1) { const had = this.map.containsKey$Object(o); this.map.remove$Object(o); return had; } return false; }
    clear$() { this.map.clear$(); }
    add$Object() { throw new java_lang_UnsupportedOperationException().$init$(); }
  }
  defClass(MapView, "java.util.HashMap$View", ["java_util_Set"]);

  // ------------------------------------------------------------------ HashSet
  class java_util_HashSet extends java_util_AbstractCollection {
    constructor() { super(); this.map = new java_util_HashMap(); }
    $init$() { return this; } $init$I() { return this; }
    $init$Collection(c) { this.addAll$Collection(c); return this; }
    add$Object(o) { if (this.map.containsKey$Object(o)) return false; this.map.put$Object$Object(o, true); return true; }
    contains$Object(o) { return this.map.containsKey$Object(o); }
    remove$Object(o) { if (!this.map.containsKey$Object(o)) return false; this.map.remove$Object(o); return true; }
    size$() { return this.map.n; } isEmpty$() { return this.map.n === 0; } clear$() { this.map.clear$(); }
    iterator$() { return this.map.keySet$().iterator$(); }
    toArray$() { return this.map.$nodes().map((e) => e.k); }
    indexOfObj(o) { return this.contains$Object(o) ? 0 : -1; }
    removeAll$Collection(c) { let ch = false; for (const it = c.iterator$(); it.hasNext$();) if (this.remove$Object(it.next$())) ch = true; return ch; }
    equals$Object(o) { return o === this; } hashCode$() { return $idh(this); }
  }
  defClass(java_util_HashSet, "java.util.HashSet", ["java_util_Set", "java_lang_Cloneable", "java_io_Serializable"]);
  class java_util_LinkedHashSet extends java_util_HashSet { }
  defClass(java_util_LinkedHashSet, "java.util.LinkedHashSet", ["java_util_Set"]);
  class java_util_TreeSet extends java_util_HashSet { toArray$() { return super.toArray$().sort((a, b) => $cmp(a, b)); } iterator$() { return new JsIter(this.toArray$().values(), (x) => this.remove$Object(x)); } }
  defClass(java_util_TreeSet, "java.util.TreeSet", ["java_util_Set"]);

  // ------------------------------------------------------------------ Collections / Arrays
  class java_util_Collections extends java_lang_Object {
    static sort$List(l) { l.a.sort((x, y) => $cmp(x, y)); }
    static sort$List$Comparator(l, c) { if (c === null) return java_util_Collections.sort$List(l); l.a.sort((x, y) => c.compare$Object$Object(x, y)); }
    static unmodifiableList$List(l) { return l; }
    static unmodifiableSet$Set(l) { return l; }
    static unmodifiableMap$Map(l) { return l; }
    static emptyList$() { return new java_util_ArrayList(); }
    static reverse$List(l) { l.a.reverse(); }
    static shuffle$List(l) { const a = l.a; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } }
    static swap$List$I$I(l, i, j) { const a = l.a; [a[i], a[j]] = [a[j], a[i]]; }
    static max$Collection(c) { let m = null; for (const it = c.iterator$(); it.hasNext$();) { const x = it.next$(); if (m === null || $cmp(x, m) > 0) m = x; } return m; }
    static min$Collection(c) { let m = null; for (const it = c.iterator$(); it.hasNext$();) { const x = it.next$(); if (m === null || $cmp(x, m) < 0) m = x; } return m; }
  }
  defClass(java_util_Collections, "java.util.Collections");
  class java_util_Arrays extends java_lang_Object {
    static fill$AI$I(a, v) { a.fill(v); } static fill$AF$F(a, v) { a.fill(v); } static fill$AZ$Z(a, v) { a.fill(v); }
    static fill$AObject$Object(a, v) { a.fill(v); } static fill$AB$B(a, v) { a.fill(v); } static fill$AD$D(a, v) { a.fill(v); }
    static fill$AI$I$I$I(a, f, t, v) { a.fill(v, f, t); }
    static sort$AI(a) { a.sort(); } static sort$AF(a) { a.sort(); } static sort$AObject(a) { a.sort((x, y) => $cmp(x, y)); }
    static copyOf$AI$I(a, n) { const r = new Int32Array(n); r.set(a.subarray(0, Math.min(n, a.length))); return r; }
    static copyOf$AF$I(a, n) { const r = new Float32Array(n); r.set(a.subarray(0, Math.min(n, a.length))); return r; }
    static copyOfRange$AI$I$I(a, f, t) { const r = new Int32Array(t - f); r.set(a.subarray(f, Math.min(t, a.length))); return r; }
    static asList$AObject(a) { const l = new java_util_ArrayList(); l.a = Array.from(a); return l; }
    static equals$AI$AI(a, b) { if (a === b) return true; if (!a || !b || a.length !== b.length) return false; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false; return true; }
    static toString$AI(a) { return a === null ? "null" : "[" + Array.from(a).join(", ") + "]"; }
    static hashCode$AI(a) { let h = 1; for (const x of a) h = (Math.imul(31, h) + x) | 0; return h; }
  }
  defClass(java_util_Arrays, "java.util.Arrays");
  class java_util_Locale extends java_lang_Object { }
  for (const n of ["ENGLISH", "GERMAN", "US", "ROOT", "UK", "FRENCH"]) java_util_Locale["S$" + n] = new java_util_Locale();
  java_util_Locale.getDefault$ = () => java_util_Locale.S$ENGLISH;
  defClass(java_util_Locale, "java.util.Locale");

  // ------------------------------------------------------------------ java.util.Random (bit exact LCG)
  class java_util_Random extends java_lang_Object {
    constructor() { super(); this.hi = 0; this.lo = 0; this.hasG = false; this.nextG = 0; }
    $init$() { return this.$init$J(BigInt(Math.floor(Math.random() * 2 ** 52)) ^ BigInt(Date.now())); }
    $init$J(seed) { this.setSeed$J(seed); return this; }
    setSeed$J(seed) {
      const s = (seed ^ 0x5DEECE66Dn) & 0xFFFFFFFFFFFFn;
      this.hi = Number(s >> 24n); this.lo = Number(s & 0xFFFFFFn); this.hasG = false;
    }
    next$I(bits) {
      const lo = this.lo, hi = this.hi;
      let nlo = lo * 0xECE66D + 0xB;
      const carry = Math.floor(nlo / 16777216);
      nlo -= carry * 16777216;
      const nhi = (hi * 0xECE66D + lo * 0x5DE + carry) % 16777216;
      this.lo = nlo; this.hi = nhi;
      return Math.floor((nhi * 16777216 + nlo) / Math.pow(2, 48 - bits)) | 0;
    }
    nextInt$() { return this.next$I(32); }
    nextInt$I(bound) {
      if (bound <= 0) throw new java_lang_IllegalArgumentException().$init$String("bound must be positive");
      if ((bound & -bound) === bound) return Math.floor(bound * this.next$I(31) / 2147483648);
      let bits, val;
      do { bits = this.next$I(31); val = bits % bound; } while (((bits - val + (bound - 1)) | 0) < 0);
      return val;
    }
    nextLong$() { return BigInt.asIntN(64, (BigInt(this.next$I(32)) << 32n) + BigInt(this.next$I(32))); }
    nextBoolean$() { return this.next$I(1) !== 0; }
    nextFloat$() { return this.next$I(24) / 16777216; }
    nextDouble$() { return (this.next$I(26) * 134217728 + this.next$I(27)) / 9007199254740992; }
    nextGaussian$() {
      if (this.hasG) { this.hasG = false; return this.nextG; }
      let v1, v2, s;
      do { v1 = 2 * this.nextDouble$() - 1; v2 = 2 * this.nextDouble$() - 1; s = v1 * v1 + v2 * v2; } while (s >= 1 || s === 0);
      const mul = Math.sqrt(-2 * Math.log(s) / s);
      this.nextG = v2 * mul; this.hasG = true; return v1 * mul;
    }
    nextBytes$AB(b) { for (let i = 0; i < b.length;) for (let r = this.nextInt$(), n = Math.min(b.length - i, 4); n-- > 0; r >>= 8) b[i++] = r; }
  }
  defClass(java_util_Random, "java.util.Random", ["java_io_Serializable"]);

  // ------------------------------------------------------------------ java.text.DecimalFormat (subset)
  class java_text_NumberFormat extends java_lang_Object { }
  defClass(java_text_NumberFormat, "java.text.NumberFormat");
  class java_text_DecimalFormat extends java_text_NumberFormat {
    constructor() { super(); this.maxF = 3; this.minF = 0; this.prefix = ""; this.group = true; }
    $init$() { return this; }
    $init$String(p) { this.group = p.includes(","); const m = /\.([0#]*)/.exec(p); if (m) { this.maxF = m[1].length; this.minF = (m[1].match(/0/g) || []).length; } return this; }
    setMaximumFractionDigits$I(n) { this.maxF = n; if (this.minF > n) this.minF = n; }
    setMinimumFractionDigits$I(n) { this.minF = n; if (this.maxF < n) this.maxF = n; }
    setPositivePrefix$String(p) { this.prefix = p; }
    setGroupingUsed$Z(b) { this.group = b; }
    format$D(d) {
      if (d !== d) return "NaN";
      let s = Math.abs(d).toFixed(this.maxF);
      if (s.includes(".")) { let [i, f] = s.split("."); while (f.length > this.minF && f.endsWith("0")) f = f.slice(0, -1); s = f.length ? i + "." + f : i; }
      if (this.group) { const [i, f] = s.split("."); s = i.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (f !== undefined ? "." + f : ""); }
      return d < 0 ? "-" + s : this.prefix + s;
    }
    format$J(l) { return this.format$D(Number(l)); }
  }
  defClass(java_text_DecimalFormat, "java.text.DecimalFormat");
  class java_text_SimpleDateFormat extends java_lang_Object {
    $init$String() { return this; } $init$String$Locale() { return this; }
    format$Date(d) { return new Date(Number(d.t)).toISOString(); }
  }
  defClass(java_text_SimpleDateFormat, "java.text.SimpleDateFormat");

  // ------------------------------------------------------------------ java.security.MessageDigest (MD5 / SHA-1)
  function md5(bytes) {
    const K = new Int32Array(64), S = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];
    for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) | 0;
    const n = bytes.length, padLen = ((n + 8) >> 6 << 6) + 64;
    const buf = new Uint8Array(padLen); for (let i = 0; i < n; i++) buf[i] = bytes[i] & 255; buf[n] = 0x80;
    const dv = new DataView(buf.buffer); dv.setUint32(padLen - 8, (n << 3) >>> 0, true); dv.setUint32(padLen - 4, Math.floor(n / 536870912), true);
    let a0 = 0x67452301, b0 = 0xefcdab89 | 0, c0 = 0x98badcfe | 0, d0 = 0x10325476;
    for (let o = 0; o < padLen; o += 64) {
      let A = a0, B = b0, C = c0, D = d0;
      for (let i = 0; i < 64; i++) {
        let F, g;
        if (i < 16) { F = (B & C) | (~B & D); g = i; }
        else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) & 15; }
        else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) & 15; }
        else { F = C ^ (B | ~D); g = (7 * i) & 15; }
        F = (F + A + K[i] + dv.getInt32(o + g * 4, true)) | 0;
        A = D; D = C; C = B;
        const s = S[(i >> 4) * 4 + (i & 3)];
        B = (B + ((F << s) | (F >>> (32 - s)))) | 0;
      }
      a0 = (a0 + A) | 0; b0 = (b0 + B) | 0; c0 = (c0 + C) | 0; d0 = (d0 + D) | 0;
    }
    const out = new Int8Array(16), od = new DataView(out.buffer);
    od.setInt32(0, a0, true); od.setInt32(4, b0, true); od.setInt32(8, c0, true); od.setInt32(12, d0, true);
    return out;
  }
  function sha1(bytes) {
    const n = bytes.length, padLen = ((n + 8) >> 6 << 6) + 64;
    const buf = new Uint8Array(padLen); for (let i = 0; i < n; i++) buf[i] = bytes[i] & 255; buf[n] = 0x80;
    const dv = new DataView(buf.buffer); dv.setUint32(padLen - 8, Math.floor(n / 536870912), false); dv.setUint32(padLen - 4, (n << 3) >>> 0, false);
    let h0 = 0x67452301, h1 = 0xefcdab89 | 0, h2 = 0x98badcfe | 0, h3 = 0x10325476, h4 = 0xc3d2e1f0 | 0;
    const w = new Int32Array(80);
    for (let o = 0; o < padLen; o += 64) {
      for (let i = 0; i < 16; i++) w[i] = dv.getInt32(o + i * 4, false);
      for (let i = 16; i < 80; i++) { const x = w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16]; w[i] = (x << 1) | (x >>> 31); }
      let a = h0, b = h1, c = h2, d = h3, e = h4;
      for (let i = 0; i < 80; i++) {
        let f, k;
        if (i < 20) { f = (b & c) | (~b & d); k = 0x5a827999; }
        else if (i < 40) { f = b ^ c ^ d; k = 0x6ed9eba1; }
        else if (i < 60) { f = (b & c) | (b & d) | (c & d); k = 0x8f1bbcdc | 0; }
        else { f = b ^ c ^ d; k = 0xca62c1d6 | 0; }
        const t = (((a << 5) | (a >>> 27)) + f + e + k + w[i]) | 0;
        e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
      }
      h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0; h4 = (h4 + e) | 0;
    }
    const out = new Int8Array(20), od = new DataView(out.buffer);
    od.setInt32(0, h0, false); od.setInt32(4, h1, false); od.setInt32(8, h2, false); od.setInt32(12, h3, false); od.setInt32(16, h4, false);
    return out;
  }
  class java_security_MessageDigest extends java_lang_Object {
    constructor() { super(); this.buf = []; this.alg = "MD5"; }
    static getInstance$String(a) {
      const u = String(a).toUpperCase();
      if (u !== "MD5" && u !== "SHA" && u !== "SHA-1" && u !== "SHA1") throw new java_security_NoSuchAlgorithmException().$init$String(a + " MessageDigest not available");
      const m = new java_security_MessageDigest(); m.alg = u === "MD5" ? "MD5" : "SHA1"; return m;
    }
    reset$() { this.buf = []; }
    update$AB(b) { for (let i = 0; i < b.length; i++) this.buf.push(b[i]); }
    digest$() { const d = this.alg === "MD5" ? md5(this.buf) : sha1(this.buf); this.buf = []; return d; }
  }
  defClass(java_security_MessageDigest, "java.security.MessageDigest");
  G.$md5 = md5; G.$sha1 = sha1;

  class java_util_Date extends java_lang_Object {
    constructor() { super(); this.t = BigInt(Date.now()); }
    $init$() { return this; } $init$J(t) { this.t = t; return this; }
    getTime$() { return this.t; }
  }
  defClass(java_util_Date, "java.util.Date");
})(globalThis);
