// Air Attack web port - Android API shim (the subset the game uses, backed by Canvas 2D / Web Audio / localStorage).
// Naming follows the translator contract (tools/JsGen.java): method `name$sig...`, ctor `$init$sig...`, static field `S$name`.
(function (G) {
  "use strict";
  const defClass = G.$defClass, defIface = G.$defIface;
  const $RES = G.$RES || {};

  // device emulated for the original code (see tools/build_assets.py DEVICE_DPI)
  const DEVICE = { w: 1280, h: 720, density: 2.0, dpi: 320 };
  G.$DEVICE = DEVICE;

  // ------------------------------------------------------------------ context / activity / resources
  defIface("android.view.SurfaceHolder"); defIface("android.view.SurfaceHolder$Callback");
  defIface("android.view.WindowManager");
  defClass(class android_content_res_AssetManager extends java_lang_Object { }, "android.content.res.AssetManager");

  class android_util_DisplayMetrics extends java_lang_Object {
    constructor() { super(); this.density = 0; this.scaledDensity = 0; this.xdpi = 0; this.ydpi = 0; this.densityDpi = 0; this.widthPixels = 0; this.heightPixels = 0; }
    $init$() { return this; }
  }
  defClass(android_util_DisplayMetrics, "android.util.DisplayMetrics");

  class android_content_res_Resources extends java_lang_Object {
    getString$I(id) { const s = $RES.string && $RES.string[id]; if (s === undefined) throw new java_lang_RuntimeException().$init$String("Resource not found: string " + id); return s; }
    getString$I$AObject(id, args) { return java_lang_String.format$String$AObject(this.getString$I(id).replace(/%(\d+)\$s/g, "%$1$s"), args); }
    getStringArray$I(id) { const a = $RES.stringArray && $RES.stringArray[id]; if (!a) throw new java_lang_RuntimeException().$init$String("Resource not found: string-array " + id); return a.slice(); }
    getIntArray$I(id) { const a = $RES.intArray && $RES.intArray[id]; if (!a) throw new java_lang_RuntimeException().$init$String("Resource not found: int-array " + id); return Int32Array.from(a); }
    getInteger$I(id) { const v = $RES.integer && $RES.integer[id]; if (v === undefined) throw new java_lang_RuntimeException().$init$String("Resource not found: integer " + id); return v; }
    getBoolean$I(id) { const v = $RES.bool && $RES.bool[id]; if (v === undefined) throw new java_lang_RuntimeException().$init$String("Resource not found: bool " + id); return v; }
    getColor$I(id) { return $RES.color[id] | 0; }
    getDisplayMetrics$() { const m = new android_util_DisplayMetrics(); m.density = DEVICE.density; m.scaledDensity = DEVICE.density; m.densityDpi = DEVICE.dpi; m.xdpi = m.ydpi = DEVICE.dpi; m.widthPixels = DEVICE.w; m.heightPixels = DEVICE.h; return m; }
    getDrawable$I(id) { const bd = new android_graphics_drawable_BitmapDrawable(); bd.bmp = android_graphics_BitmapFactory.decodeResource$Resources$I(this, id); return bd; }
  }
  defClass(android_content_res_Resources, "android.content.res.Resources");
  const RESOURCES = new android_content_res_Resources(), ASSETS = new android_content_res_AssetManager();

  class android_content_Context extends java_lang_Object {
    getResources$() { return RESOURCES; }
    getAssets$() { return ASSETS; }
    getApplicationContext$() { return this; }
    getBaseContext$() { return this; }
    getPackageName$() { return "dk.logisoft.airattack"; }
    getSystemService$String() { return null; }
    getPackageManager$() { return { hasSystemFeature$String() { return true; } }; }
    getSharedPreferences$String$I(name) { return android_content_SharedPreferencesImpl.get(name); }
    getString$I(id) { return RESOURCES.getString$I(id); }
    getString$I$AObject(id, a) { return RESOURCES.getString$I$AObject(id, a); }
  }
  defClass(android_content_Context, "android.content.Context");
  class android_content_ContextWrapper extends android_content_Context { }
  defClass(android_content_ContextWrapper, "android.content.ContextWrapper");
  class android_app_Activity extends android_content_ContextWrapper {
    runOnUiThread$Runnable(r) { r.run$(); }
    isFinishing$() { return false; }
    finish$() { }
    startActivityForResult$Intent$I() { }
    getWindowManager$() { return { getDefaultDisplay$() { return new android_view_Display(); } }; }
  }
  defClass(android_app_Activity, "android.app.Activity");
  defClass(class android_app_Application extends android_content_ContextWrapper { }, "android.app.Application");
  defClass(class android_content_Intent extends java_lang_Object { }, "android.content.Intent");
  class android_view_Display extends java_lang_Object {
    getMetrics$DisplayMetrics(m) { m.density = DEVICE.density; m.scaledDensity = DEVICE.density; m.densityDpi = DEVICE.dpi; m.xdpi = m.ydpi = DEVICE.dpi; m.widthPixels = DEVICE.w; m.heightPixels = DEVICE.h; }
    getWidth$() { return DEVICE.w; } getHeight$() { return DEVICE.h; } getRefreshRate$() { return 60; }
  }
  defClass(android_view_Display, "android.view.Display");

  // ------------------------------------------------------------------ SharedPreferences (localStorage, typed like Android's XML store)
  defIface("android.content.SharedPreferences"); defIface("android.content.SharedPreferences$Editor");
  const memStore = {};
  function loadPrefs(name) {
    try { const t = G.localStorage && G.localStorage.getItem("aa:" + name); if (t) return JSON.parse(t); } catch (e) { }
    return memStore[name] || {};
  }
  function savePrefs(name, data) {
    memStore[name] = data;
    try { G.localStorage && G.localStorage.setItem("aa:" + name, JSON.stringify(data)); } catch (e) { }
  }
  const cce = (k, want, got) => new java_lang_ClassCastException().$init$String(k + ": expected " + want + " but is " + got);
  class android_content_SharedPreferencesImpl extends java_lang_Object {
    constructor() { super(); this.name = ""; this.d = {}; }
    static get(name) {
      const c = android_content_SharedPreferencesImpl.cache || (android_content_SharedPreferencesImpl.cache = {});
      if (!c[name]) { const p = new android_content_SharedPreferencesImpl(); p.name = name; p.d = loadPrefs(name); c[name] = p; }
      return c[name];
    }
    contains$String(k) { return Object.prototype.hasOwnProperty.call(this.d, k); }
    $get(k, t, def, want) {
      const e = this.d[k]; if (e === undefined) return def;
      if (e.t !== t) throw cce(k, want, e.t);
      return e.v;
    }
    getInt$String$I(k, d) { return this.$get(k, "i", d, "int"); }
    getBoolean$String$Z(k, d) { return this.$get(k, "b", d, "boolean"); }
    getFloat$String$F(k, d) { return this.$get(k, "f", d, "float"); }
    getString$String$String(k, d) { return this.$get(k, "s", d, "String"); }
    getLong$String$J(k, d) { const e = this.d[k]; if (e === undefined) return d; if (e.t !== "l") throw cce(k, "long", e.t); return BigInt(e.v); }
    getAll$() {
      const m = new java_util_HashMap();
      for (const k of Object.keys(this.d)) { const e = this.d[k]; m.put$Object$Object(k, e.t === "l" ? BigInt(e.v) : e.v); }
      return m;
    }
    edit$() { return new android_content_SharedPreferencesEditor(this); }
  }
  defClass(android_content_SharedPreferencesImpl, "android.content.SharedPreferencesImpl", ["android_content_SharedPreferences"]);
  class android_content_SharedPreferencesEditor extends java_lang_Object {
    constructor(p) { super(); this.p = p; this.ops = []; }
    putString$String$String(k, v) { this.ops.push([k, v === null ? null : { t: "s", v }]); return this; }
    putInt$String$I(k, v) { this.ops.push([k, { t: "i", v }]); return this; }
    putLong$String$J(k, v) { this.ops.push([k, { t: "l", v: v.toString() }]); return this; }
    putFloat$String$F(k, v) { this.ops.push([k, { t: "f", v }]); return this; }
    putBoolean$String$Z(k, v) { this.ops.push([k, { t: "b", v }]); return this; }
    remove$String(k) { this.ops.push([k, null]); return this; }
    clear$() { this.ops.push([null, null]); return this; }
    commit$() {
      const d = this.p.d;
      for (const [k, e] of this.ops) { if (k === null) { for (const x of Object.keys(d)) delete d[x]; } else if (e === null) delete d[k]; else d[k] = e; }
      this.ops = []; savePrefs(this.p.name, d); return true;
    }
    apply$() { this.commit$(); }
  }
  defClass(android_content_SharedPreferencesEditor, "android.content.SharedPreferencesEditor", ["android_content_SharedPreferences$Editor"]);

  // ------------------------------------------------------------------ logging (silent unless ?debug)
  const logOn = () => G.$jvmDebug;
  class android_util_Log extends java_lang_Object { }
  for (const [n, fn] of [["d", "debug"], ["i", "info"], ["w", "warn"], ["e", "error"], ["v", "log"]]) {
    android_util_Log[n + "$String$String"] = (t, m) => { if (logOn() || n === "e") console[fn](`[${t}] ${m}`); return 0; };
    android_util_Log[n + "$String$String$Throwable"] = (t, m, e) => { if (logOn() || n === "e") console[fn](`[${t}] ${m}`, e ? e.toString$() : ""); return 0; };
  }
  defClass(android_util_Log, "android.util.Log");

  // ------------------------------------------------------------------ graphics: Rect / Matrix / Path / Paint
  class android_graphics_Rect extends java_lang_Object {
    constructor() { super(); this.left = 0; this.top = 0; this.right = 0; this.bottom = 0; }
    $init$() { return this; }
    $init$I$I$I$I(l, t, r, b) { this.left = l; this.top = t; this.right = r; this.bottom = b; return this; }
    $init$Rect(o) { this.left = o.left; this.top = o.top; this.right = o.right; this.bottom = o.bottom; return this; }
    set$I$I$I$I(l, t, r, b) { this.left = l; this.top = t; this.right = r; this.bottom = b; }
    set$Rect(o) { this.left = o.left; this.top = o.top; this.right = o.right; this.bottom = o.bottom; }
    width$() { return this.right - this.left; } height$() { return this.bottom - this.top; }
    centerX$() { return (this.left + this.right) >> 1; } centerY$() { return (this.top + this.bottom) >> 1; }
    isEmpty$() { return this.left >= this.right || this.top >= this.bottom; }
    contains$I$I(x, y) { return this.left < this.right && this.top < this.bottom && x >= this.left && x < this.right && y >= this.top && y < this.bottom; }
    offset$I$I(dx, dy) { this.left += dx; this.right += dx; this.top += dy; this.bottom += dy; }
    setEmpty$() { this.left = this.right = this.top = this.bottom = 0; }
    intersect$I$I$I$I(l, t, r, b) { if (this.left < r && l < this.right && this.top < b && t < this.bottom) { if (this.left < l) this.left = l; if (this.top < t) this.top = t; if (this.right > r) this.right = r; if (this.bottom > b) this.bottom = b; return true; } return false; }
    intersect$Rect(o) { return this.intersect$I$I$I$I(o.left, o.top, o.right, o.bottom); }
    intersects$I$I$I$I(l, t, r, b) { return this.left < r && l < this.right && this.top < b && t < this.bottom; }
    static intersects$Rect$Rect(a, b) { return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom; }
    union$Rect(o) { if (o.left < o.right && o.top < o.bottom) { if (this.left < this.right && this.top < this.bottom) { this.left = Math.min(this.left, o.left); this.top = Math.min(this.top, o.top); this.right = Math.max(this.right, o.right); this.bottom = Math.max(this.bottom, o.bottom); } else this.set$Rect(o); } }
    inset$I$I(dx, dy) { this.left += dx; this.top += dy; this.right -= dx; this.bottom -= dy; }
    toString$() { return "Rect(" + this.left + ", " + this.top + " - " + this.right + ", " + this.bottom + ")"; }
  }
  defClass(android_graphics_Rect, "android.graphics.Rect");
  class android_graphics_RectF extends java_lang_Object {
    constructor() { super(); this.left = 0; this.top = 0; this.right = 0; this.bottom = 0; }
    $init$() { return this; }
    $init$F$F$F$F(l, t, r, b) { this.left = l; this.top = t; this.right = r; this.bottom = b; return this; }
    set$F$F$F$F(l, t, r, b) { this.left = l; this.top = t; this.right = r; this.bottom = b; }
    width$() { return this.right - this.left; } height$() { return this.bottom - this.top; }
  }
  defClass(android_graphics_RectF, "android.graphics.RectF");

  // Matrix: row-major [sx kx tx; ky sy ty]; maps x' = sx*x + kx*y + tx ; y' = ky*x + sy*y + ty
  class android_graphics_Matrix extends java_lang_Object {
    constructor() { super(); this.sx = 1; this.kx = 0; this.tx = 0; this.ky = 0; this.sy = 1; this.ty = 0; }
    $init$() { return this; }
    $init$Matrix(m) { this.set$Matrix(m); return this; }
    reset$() { this.sx = 1; this.kx = 0; this.tx = 0; this.ky = 0; this.sy = 1; this.ty = 0; }
    set$Matrix(m) { this.sx = m.sx; this.kx = m.kx; this.tx = m.tx; this.ky = m.ky; this.sy = m.sy; this.ty = m.ty; }
    $mul(a, b) { // this = a * b  (apply b first, then a)
      const sx = a.sx * b.sx + a.kx * b.ky, kx = a.sx * b.kx + a.kx * b.sy, tx = a.sx * b.tx + a.kx * b.ty + a.tx;
      const ky = a.ky * b.sx + a.sy * b.ky, sy = a.ky * b.kx + a.sy * b.sy, ty = a.ky * b.tx + a.sy * b.ty + a.ty;
      this.sx = sx; this.kx = kx; this.tx = tx; this.ky = ky; this.sy = sy; this.ty = ty;
    }
    static $T(dx, dy) { const m = new android_graphics_Matrix(); m.tx = dx; m.ty = dy; return m; }
    static $S(sx, sy, px, py) { const m = new android_graphics_Matrix(); m.sx = sx; m.sy = sy; m.tx = px - sx * px; m.ty = py - sy * py; return m; }
    static $R(deg, px, py) {
      const r = deg * Math.PI / 180, s = Math.sin(r), c = Math.cos(r), m = new android_graphics_Matrix();
      m.sx = c; m.kx = -s; m.ky = s; m.sy = c; m.tx = px - c * px + s * py; m.ty = py - s * px - c * py; return m;
    }
    setTranslate$F$F(dx, dy) { this.reset$(); this.tx = dx; this.ty = dy; }
    setScale$F$F(sx, sy) { this.reset$(); this.sx = sx; this.sy = sy; }
    setScale$F$F$F$F(sx, sy, px, py) { this.set$Matrix(android_graphics_Matrix.$S(sx, sy, px, py)); }
    setRotate$F(d) { this.set$Matrix(android_graphics_Matrix.$R(d, 0, 0)); }
    setRotate$F$F$F(d, px, py) { this.set$Matrix(android_graphics_Matrix.$R(d, px, py)); }
    postTranslate$F$F(dx, dy) { this.tx += dx; this.ty += dy; return true; }
    postScale$F$F(sx, sy) { this.$mul(android_graphics_Matrix.$S(sx, sy, 0, 0), this); return true; }
    postScale$F$F$F$F(sx, sy, px, py) { this.$mul(android_graphics_Matrix.$S(sx, sy, px, py), this); return true; }
    postRotate$F(d) { this.$mul(android_graphics_Matrix.$R(d, 0, 0), this); return true; }
    postRotate$F$F$F(d, px, py) { this.$mul(android_graphics_Matrix.$R(d, px, py), this); return true; }
    postConcat$Matrix(m) { this.$mul(m, this); return true; }
    preTranslate$F$F(dx, dy) { this.$mul(this, android_graphics_Matrix.$T(dx, dy)); return true; }
    preScale$F$F(sx, sy) { this.$mul(this, android_graphics_Matrix.$S(sx, sy, 0, 0)); return true; }
    preScale$F$F$F$F(sx, sy, px, py) { this.$mul(this, android_graphics_Matrix.$S(sx, sy, px, py)); return true; }
    preRotate$F(d) { this.$mul(this, android_graphics_Matrix.$R(d, 0, 0)); return true; }
    preRotate$F$F$F(d, px, py) { this.$mul(this, android_graphics_Matrix.$R(d, px, py)); return true; }
    preConcat$Matrix(m) { this.$mul(this, m); return true; }
    mapPoints$AF(p) { for (let i = 0; i + 1 < p.length; i += 2) { const x = p[i], y = p[i + 1]; p[i] = this.sx * x + this.kx * y + this.tx; p[i + 1] = this.ky * x + this.sy * y + this.ty; } }
    mapRadius$F(r) { return r * Math.sqrt(Math.abs(this.sx * this.sy - this.kx * this.ky)); }
    getValues$AF(v) { v[0] = this.sx; v[1] = this.kx; v[2] = this.tx; v[3] = this.ky; v[4] = this.sy; v[5] = this.ty; v[6] = 0; v[7] = 0; v[8] = 1; }
    setValues$AF(v) { this.sx = v[0]; this.kx = v[1]; this.tx = v[2]; this.ky = v[3]; this.sy = v[4]; this.ty = v[5]; }
  }
  defClass(android_graphics_Matrix, "android.graphics.Matrix");

  class android_graphics_Path extends java_lang_Object {
    constructor() { super(); this.cmds = []; }
    $init$() { return this; }
    moveTo$F$F(x, y) { this.cmds.push(["M", x, y]); } lineTo$F$F(x, y) { this.cmds.push(["L", x, y]); }
    quadTo$F$F$F$F(a, b, c, d) { this.cmds.push(["Q", a, b, c, d]); }
    close$() { this.cmds.push(["Z"]); } reset$() { this.cmds.length = 0; }
  }
  defClass(android_graphics_Path, "android.graphics.Path");
  defClass(class android_graphics_PathEffect extends java_lang_Object { }, "android.graphics.PathEffect");
  class android_graphics_DashPathEffect extends android_graphics_PathEffect {
    $init$AF$F(i, p) { this.iv = Array.from(i); this.phase = p; return this; }
  }
  defClass(android_graphics_DashPathEffect, "android.graphics.DashPathEffect");
  class android_graphics_Typeface extends java_lang_Object {
    constructor() { super(); this.family = "monospace"; }
    static createFromAsset$AssetManager$String(am, path) { const t = new android_graphics_Typeface(); t.family = /joystix/i.test(path) ? "Joystix" : "monospace"; return t; }
  }
  android_graphics_Typeface.S$DEFAULT = new android_graphics_Typeface(); android_graphics_Typeface.S$MONOSPACE = new android_graphics_Typeface();
  defClass(android_graphics_Typeface, "android.graphics.Typeface");

  function mkEnum(jname, names) {
    const simple = jname.substring(jname.lastIndexOf(".") + 1).replace("$", "_");
    const c = { [simple]: class extends java_lang_Enum { } }[simple];
    defClass(c, jname);
    c.$VALUES = names.map((n, i) => { const e = new c(); e.$name = n; e.$ordinal = i; c["S$" + n] = e; return e; });
    c.values$ = () => c.$VALUES.slice();
    c.$ci = true;
    return c;
  }
  mkEnum("android.graphics.Bitmap$Config", ["ALPHA_8", "ARGB_4444", "ARGB_8888", "RGB_565"]);
  mkEnum("android.graphics.Paint$Style", ["FILL", "STROKE", "FILL_AND_STROKE"]);
  mkEnum("android.graphics.Paint$Align", ["LEFT", "CENTER", "RIGHT"]);
  mkEnum("android.graphics.Paint$Cap", ["BUTT", "ROUND", "SQUARE"]);

  const cssCache = new Map();
  const cssColor = (c) => {
    let s = cssCache.get(c);
    if (s === undefined) {
      const a = (c >>> 24) / 255;
      s = "rgba(" + ((c >> 16) & 255) + "," + ((c >> 8) & 255) + "," + (c & 255) + "," + (a === 1 ? 1 : Math.round(a * 1000) / 1000) + ")";
      if (cssCache.size < 8192) cssCache.set(c, s);
    }
    return s;
  };
  // only touch ctx.fillStyle when the colour really changes (particles/rects call this thousands of times per frame)
  const setFill = (ctx, c) => { const s = cssColor(c); if (ctx.$fs !== s) { ctx.fillStyle = s; ctx.$fs = s; } };
  class android_graphics_Paint extends java_lang_Object {
    constructor() {
      super(); this.color = 0xFF000000 | 0; this.style = null; this.sw = 0; this.ts = 12; this.align = null; this.tf = null; this.aa = false; this.fb = false; this.pe = null; this.cap = null;
    }
    $init$() { this.style = android_graphics_Paint$Style.S$FILL; this.align = android_graphics_Paint$Align.S$LEFT; return this; }
    $init$I(flags) { this.$init$(); this.aa = (flags & 1) !== 0; this.fb = (flags & 2) !== 0; return this; }
    $init$Paint(p) { this.$init$(); Object.assign(this, p); return this; }
    setColor$I(c) { this.color = c; } getColor$() { return this.color; }
    setAlpha$I(a) { this.color = ((a & 255) << 24) | (this.color & 0xFFFFFF); } getAlpha$() { return this.color >>> 24; }
    setARGB$I$I$I$I(a, r, g, b) { this.color = ((a & 255) << 24) | ((r & 255) << 16) | ((g & 255) << 8) | (b & 255); }
    setStyle$Paint$Style(s) { this.style = s; } setStrokeWidth$F(w) { this.sw = w; } getStrokeWidth$() { return this.sw; }
    setAntiAlias$Z(b) { this.aa = b; } setDither$Z() { } setFilterBitmap$Z(b) { this.fb = b; }
    setTextSize$F(s) { this.ts = s; } getTextSize$() { return this.ts; }
    setTextAlign$Paint$Align(a) { this.align = a; } setTypeface$Typeface(t) { this.tf = t; } getTypeface$() { return this.tf; }
    setUnderlineText$Z() { } setSubpixelText$Z() { } setLinearText$Z() { } setFakeBoldText$Z() { } setTextScaleX$F() { } setXfermode$Object() { }
    setStrokeCap$Paint$Cap(c) { this.cap = c; }
    setPathEffect$PathEffect(e) { this.pe = e; return e; }
    $font() { return this.ts + "px " + (this.tf ? '"' + this.tf.family + '"' : "sans-serif") + (this.tf && this.tf.family === "Joystix" ? ", monospace" : ""); }
    measureText$String(t) { const c = G.$measureCtx; c.font = this.$font(); return c.measureText(t).width; }
    ascent$() { return -this.ts * 0.9; } descent$() { return this.ts * 0.2; }
  }
  defClass(android_graphics_Paint, "android.graphics.Paint");

  // ------------------------------------------------------------------ Bitmap
  const makeCanvasEl = (w, h) => (typeof OffscreenCanvas !== "undefined" && !G.$noOffscreen) ? new OffscreenCanvas(w, h) : Object.assign(G.document.createElement("canvas"), { width: w, height: h });
  G.$measureCtx = (typeof OffscreenCanvas !== "undefined") ? new OffscreenCanvas(4, 4).getContext("2d") : null;

  class android_graphics_Bitmap extends java_lang_Object {
    constructor() { super(); this.cv = null; this.ctx = null; this.w = 0; this.h = 0; this.cfg = null; this.rec = false; this.mutable = true; }
    static $make(w, h, cfg) {
      if (w <= 0 || h <= 0) throw new java_lang_IllegalArgumentException().$init$String("width and height must be > 0");
      const b = new android_graphics_Bitmap();
      b.cv = makeCanvasEl(w, h); b.w = w; b.h = h; b.cfg = cfg || android_graphics_Bitmap$Config.S$ARGB_8888;
      b.ctx = b.cv.getContext("2d", { alpha: b.cfg !== android_graphics_Bitmap$Config.S$RGB_565, willReadFrequently: true });
      b.ctx.imageSmoothingEnabled = false;
      return b;
    }
    static createBitmap$I$I$Bitmap$Config(w, h, cfg) { return android_graphics_Bitmap.$make(w, h, cfg); }
    static createBitmap$AI$I$I$Bitmap$Config(colors, w, h, cfg) { const b = android_graphics_Bitmap.$make(w, h, cfg); b.setPixels$AI$I$I$I$I$I$I(colors, 0, w, 0, 0, w, h); return b; }
    static createBitmap$Bitmap$I$I$I$I(src, x, y, w, h) {
      const b = android_graphics_Bitmap.$make(w, h, src.cfg); b.ctx.drawImage(src.cv, x, y, w, h, 0, 0, w, h); return b;
    }
    static createBitmap$Bitmap$I$I$I$I$Matrix$Z(src, x, y, w, h, m, filter) {
      if (m === null) return android_graphics_Bitmap.createBitmap$Bitmap$I$I$I$I(src, x, y, w, h);
      // bounds of the transformed rectangle
      const xs = [0, w, 0, w], ys = [0, 0, h, h]; let minx = 1e30, miny = 1e30, maxx = -1e30, maxy = -1e30;
      for (let i = 0; i < 4; i++) { const px = m.sx * xs[i] + m.kx * ys[i] + m.tx, py = m.ky * xs[i] + m.sy * ys[i] + m.ty; minx = Math.min(minx, px); maxx = Math.max(maxx, px); miny = Math.min(miny, py); maxy = Math.max(maxy, py); }
      const W = Math.max(1, Math.round(maxx - minx)), H = Math.max(1, Math.round(maxy - miny));
      const b = android_graphics_Bitmap.$make(W, H, src.cfg); b.ctx.imageSmoothingEnabled = !!filter;
      b.ctx.setTransform(m.sx, m.ky, m.kx, m.sy, m.tx - minx, m.ty - miny); b.ctx.drawImage(src.cv, x, y, w, h, 0, 0, w, h); b.ctx.setTransform(1, 0, 0, 1, 0, 0);
      return b;
    }
    static createScaledBitmap$Bitmap$I$I$Z(src, w, h, filter) {
      const b = android_graphics_Bitmap.$make(w, h, src.cfg);
      b.ctx.imageSmoothingEnabled = !!filter; if (filter) b.ctx.imageSmoothingQuality = "medium";
      b.ctx.drawImage(src.cv, 0, 0, src.w, src.h, 0, 0, w, h); b.ctx.imageSmoothingEnabled = false; return b;
    }
    getWidth$() { return this.w; } getHeight$() { return this.h; }
    getConfig$() { return this.cfg; } isRecycled$() { return this.rec; } recycle$() { this.rec = true; } isMutable$() { return this.mutable; }
    hasAlpha$() { return this.cfg !== android_graphics_Bitmap$Config.S$RGB_565; } setHasAlpha$Z() { }
    getRowBytes$() { return this.w * (this.cfg === android_graphics_Bitmap$Config.S$ARGB_8888 ? 4 : 2); }
    getByteCount$() { return this.getRowBytes$() * this.h; }
    copy$Bitmap$Config$Z(cfg) { const b = android_graphics_Bitmap.$make(this.w, this.h, cfg); b.ctx.drawImage(this.cv, 0, 0); return b; }
    eraseColor$I(c) { this.ctx.setTransform(1, 0, 0, 1, 0, 0); this.ctx.clearRect(0, 0, this.w, this.h); if ((c >>> 24) !== 0 || this.cfg === android_graphics_Bitmap$Config.S$RGB_565) { setFill(this.ctx, c); this.ctx.fillRect(0, 0, this.w, this.h); } }
    getPixel$I$I(x, y) {
      if (x < 0 || y < 0 || x >= this.w || y >= this.h) throw new java_lang_IllegalArgumentException().$init$String("x/y must be < bitmap.width()/height()");
      const d = this.ctx.getImageData(x, y, 1, 1).data; return ((d[3] << 24) | (d[0] << 16) | (d[1] << 8) | d[2]) | 0;
    }
    setPixel$I$I$I(x, y, c) {
      const id = this.ctx.createImageData(1, 1); id.data[0] = (c >> 16) & 255; id.data[1] = (c >> 8) & 255; id.data[2] = c & 255; id.data[3] = c >>> 24;
      this.ctx.putImageData(id, x, y);
    }
    getPixels$AI$I$I$I$I$I$I(px, off, stride, x, y, w, h) {
      if (w <= 0 || h <= 0) return;
      const img = this.ctx.getImageData(x, y, w, h), u = new Uint32Array(img.data.buffer);
      for (let r = 0; r < h; r++) {
        let o = off + r * stride, i = r * w;
        for (let c = 0; c < w; c++) { const v = u[i++]; px[o++] = (v & 0xFF00FF00) | ((v & 0xFF) << 16) | ((v >>> 16) & 0xFF); }
      }
    }
    setPixels$AI$I$I$I$I$I$I(px, off, stride, x, y, w, h) {
      if (w <= 0 || h <= 0) return;
      const img = this.ctx.createImageData(w, h), u = new Uint32Array(img.data.buffer);
      for (let r = 0; r < h; r++) {
        let o = off + r * stride, i = r * w;
        for (let c = 0; c < w; c++) { const v = px[o++]; u[i++] = (v & 0xFF00FF00) | ((v & 0xFF) << 16) | ((v >>> 16) & 0xFF); }
      }
      this.ctx.putImageData(img, x, y);
    }
  }
  defClass(android_graphics_Bitmap, "android.graphics.Bitmap");

  class android_graphics_BitmapFactory$Options extends java_lang_Object {
    constructor() { super(); this.inScaled = true; this.inDither = false; this.inPurgeable = false; this.inInputShareable = false; this.inPreferredConfig = null; this.inSampleSize = 1; this.inDensity = 0; this.inTargetDensity = 0; this.inJustDecodeBounds = false; this.outWidth = 0; this.outHeight = 0; this.inMutable = false; }
    $init$() { return this; }
  }
  defClass(android_graphics_BitmapFactory$Options, "android.graphics.BitmapFactory$Options");
  class android_graphics_BitmapFactory extends java_lang_Object {
    static decodeResource$Resources$I(res, id) { return android_graphics_BitmapFactory.decodeResource$Resources$I$BitmapFactory$Options(res, id, null); }
    static decodeResource$Resources$I$BitmapFactory$Options(res, id, opts) {
      const name = $RES.drawable && $RES.drawable[id];
      if (name === undefined) throw new java_lang_RuntimeException().$init$String("Resource not found: drawable " + id);
      const img = G.$assets && G.$assets.images[name];
      if (!img) throw new java_lang_RuntimeException().$init$String("Drawable not loaded: " + name);
      const srcDpi = ($RES.drawableDensity && $RES.drawableDensity[name]) || 160;
      let w = img.width, h = img.height;
      const scaled = opts === null || opts.inScaled;
      if (scaled && srcDpi !== DEVICE.dpi) { const s = DEVICE.dpi / srcDpi; w = Math.floor(w * s + 0.5); h = Math.floor(h * s + 0.5); }
      const cfg = opts !== null && opts.inPreferredConfig ? opts.inPreferredConfig : android_graphics_Bitmap$Config.S$ARGB_8888;
      const b = android_graphics_Bitmap.$make(w, h, android_graphics_Bitmap$Config.S$ARGB_8888);
      if (w !== img.width || h !== img.height) { b.ctx.imageSmoothingEnabled = true; b.ctx.imageSmoothingQuality = "medium"; }
      b.ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, w, h); b.ctx.imageSmoothingEnabled = false;
      b.mutable = false;
      return b;
    }
  }
  defClass(android_graphics_BitmapFactory, "android.graphics.BitmapFactory");
  class android_graphics_drawable_Drawable extends java_lang_Object { }
  defClass(android_graphics_drawable_Drawable, "android.graphics.drawable.Drawable");
  class android_graphics_drawable_BitmapDrawable extends android_graphics_drawable_Drawable {
    constructor() { super(); this.bmp = null; this.bl = 0; this.bt = 0; }
    getIntrinsicWidth$() { return this.bmp.w; } getIntrinsicHeight$() { return this.bmp.h; }
    setBounds$I$I$I$I(l, t) { this.bl = l; this.bt = t; }
    draw$Canvas(c) { c.drawBitmap$Bitmap$F$F$Paint(this.bmp, this.bl, this.bt, null); }
    getBitmap$() { return this.bmp; }
  }
  defClass(android_graphics_drawable_BitmapDrawable, "android.graphics.drawable.BitmapDrawable");

  // ------------------------------------------------------------------ Canvas
  class android_graphics_Canvas extends java_lang_Object {
    constructor() { super(); this.ctx = null; this.w = 0; this.h = 0; this.smooth = false; }
    $init$() { return this; }
    $init$Bitmap(b) { this.ctx = b.ctx; this.w = b.w; this.h = b.h; return this; }
    static $forContext(ctx, w, h) { const c = new android_graphics_Canvas(); c.ctx = ctx; c.w = w; c.h = h; ctx.imageSmoothingEnabled = false; return c; }
    getWidth$() { return this.w; } getHeight$() { return this.h; }
    $smooth(on) { if (this.smooth !== on) { this.smooth = on; this.ctx.imageSmoothingEnabled = on; } }
    drawBitmap$Bitmap$F$F$Paint(b, x, y, p) {
      const ctx = this.ctx; this.$smooth(p !== null && p.fb);
      if (p !== null && (p.color >>> 24) !== 255) { ctx.globalAlpha = (p.color >>> 24) / 255; ctx.drawImage(b.cv, x, y); ctx.globalAlpha = 1; }
      else ctx.drawImage(b.cv, x, y);
    }
    drawBitmap$Bitmap$Matrix$Paint(b, m, p) {
      const ctx = this.ctx; this.$smooth(p !== null && p.fb);
      ctx.save(); ctx.transform(m.sx, m.ky, m.kx, m.sy, m.tx, m.ty);
      if (p !== null && (p.color >>> 24) !== 255) ctx.globalAlpha = (p.color >>> 24) / 255;
      ctx.drawImage(b.cv, 0, 0); ctx.restore();
    }
    drawBitmap$Bitmap$Rect$Rect$Paint(b, s, d, p) {
      const ctx = this.ctx; this.$smooth(p !== null && p.fb);
      const sl = s === null ? 0 : s.left, st = s === null ? 0 : s.top, sw = s === null ? b.w : s.right - s.left, sh = s === null ? b.h : s.bottom - s.top;
      if (sw <= 0 || sh <= 0 || d.right <= d.left || d.bottom <= d.top) return;
      if (p !== null && (p.color >>> 24) !== 255) { ctx.globalAlpha = (p.color >>> 24) / 255; ctx.drawImage(b.cv, sl, st, sw, sh, d.left, d.top, d.right - d.left, d.bottom - d.top); ctx.globalAlpha = 1; }
      else ctx.drawImage(b.cv, sl, st, sw, sh, d.left, d.top, d.right - d.left, d.bottom - d.top);
    }
    $stroke(p) { const ctx = this.ctx; ctx.strokeStyle = cssColor(p.color); ctx.lineWidth = p.sw > 0 ? p.sw : 1; ctx.setLineDash(p.pe && p.pe.iv ? p.pe.iv : []); ctx.lineDashOffset = p.pe ? p.pe.phase : 0; }
    drawRect$F$F$F$F$Paint(l, t, r, b, p) {
      const ctx = this.ctx;
      if (p.style === android_graphics_Paint$Style.S$STROKE) { this.$stroke(p); ctx.strokeRect(l, t, r - l, b - t); ctx.setLineDash([]); }
      else { setFill(ctx, p.color); ctx.fillRect(l, t, r - l, b - t); }
    }
    drawRect$Rect$Paint(r, p) { this.drawRect$F$F$F$F$Paint(r.left, r.top, r.right, r.bottom, p); }
    drawCircle$F$F$F$Paint(cx, cy, r, p) {
      const ctx = this.ctx; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      if (p.style === android_graphics_Paint$Style.S$STROKE) { this.$stroke(p); ctx.stroke(); ctx.setLineDash([]); } else { setFill(ctx, p.color); ctx.fill(); }
    }
    drawLine$F$F$F$F$Paint(x0, y0, x1, y1, p) { const ctx = this.ctx; this.$stroke(p); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.setLineDash([]); }
    drawPoint$F$F$Paint(x, y, p) { setFill(this.ctx, p.color); this.ctx.fillRect(x, y, 1, 1); }
    drawText$String$F$F$Paint(t, x, y, p) {
      const ctx = this.ctx; ctx.font = p.$font(); setFill(ctx, p.color);
      ctx.textAlign = p.align === android_graphics_Paint$Align.S$CENTER ? "center" : p.align === android_graphics_Paint$Align.S$RIGHT ? "right" : "left";
      ctx.textBaseline = "alphabetic"; ctx.fillText(t, x, y);
    }
    drawColor$I(c) { setFill(this.ctx, c); this.ctx.fillRect(0, 0, this.w, this.h); }
    drawARGB$I$I$I$I(a, r, g, b) { this.drawColor$I(((a & 255) << 24) | ((r & 255) << 16) | ((g & 255) << 8) | (b & 255)); }
    drawRGB$I$I$I(r, g, b) { this.drawARGB$I$I$I$I(255, r, g, b); }
    save$() { this.ctx.save(); return 0; } restore$() { this.ctx.restore(); }
    translate$F$F(x, y) { this.ctx.translate(x, y); } scale$F$F(x, y) { this.ctx.scale(x, y); }
    rotate$F(d) { this.ctx.rotate(d * Math.PI / 180); }
    clipRect$F$F$F$F(l, t, r, b) { this.ctx.beginPath(); this.ctx.rect(l, t, r - l, b - t); this.ctx.clip(); return true; }
    setMatrix$Matrix(m) { this.ctx.setTransform(m.sx, m.ky, m.kx, m.sy, m.tx, m.ty); }
  }
  defClass(android_graphics_Canvas, "android.graphics.Canvas");

  // ------------------------------------------------------------------ input events
  class android_view_InputDevice extends java_lang_Object {
    static getDevice$I() { return null; } getMotionRange$I$I() { return null; }
  }
  defClass(android_view_InputDevice, "android.view.InputDevice");
  defClass(class android_view_InputDevice$MotionRange extends java_lang_Object { getFlat$() { return 0; } }, "android.view.InputDevice$MotionRange");
  class android_view_MotionEvent extends java_lang_Object {
    constructor() { super(); this.action = 0; this.x = 0; this.y = 0; this.t = 0n; this.src = 4098; this.dev = 0; this.axes = {}; }
    static $obtain(action, x, y, timeMs) { const e = new android_view_MotionEvent(); e.action = action; e.x = x; e.y = y; e.t = BigInt(Math.round(timeMs)); return e; }
    getAction$() { return this.action; } getActionMasked$() { return this.action & 255; } getActionIndex$() { return 0; }
    getX$() { return this.x; } getY$() { return this.y; } getX$I() { return this.x; } getY$I() { return this.y; }
    getPointerCount$() { return 1; } getPointerId$I() { return 0; } findPointerIndex$I() { return 0; }
    getXPrecision$() { return 1; } getYPrecision$() { return 1; }
    getEventTime$() { return this.t; } getSource$() { return this.src; } getDeviceId$() { return this.dev; } getDevice$() { return null; }
    getAxisValue$I(a) { return this.axes[a] || 0; } getHistorySize$() { return 0; } getHistoricalAxisValue$I$I() { return 0; } getHistoricalX$I() { return this.x; } getHistoricalY$I() { return this.y; }
  }
  defClass(android_view_MotionEvent, "android.view.MotionEvent");
  class android_view_KeyEvent extends java_lang_Object {
    constructor() { super(); this.action = 0; this.code = 0; this.dev = 0; }
    static $obtain(action, code, dev) { const e = new android_view_KeyEvent(); e.action = action; e.code = code; e.dev = dev || 0; return e; }
    getAction$() { return this.action; } getKeyCode$() { return this.code; } getDeviceId$() { return this.dev; } getRepeatCount$() { return 0; } getSource$() { return 257; }
    getEventTime$() { return BigInt(Date.now()); } getMetaState$() { return 0; } getUnicodeChar$() { return 0; }
  }
  defClass(android_view_KeyEvent, "android.view.KeyEvent");

  // ------------------------------------------------------------------ audio: SoundPool (Web Audio) + MediaPlayer (HTMLAudioElement)
  let actx = null;
  G.$audioCtx = function () { if (!actx && (G.AudioContext || G.webkitAudioContext)) actx = new (G.AudioContext || G.webkitAudioContext)(); return actx; };
  class android_media_SoundPool extends java_lang_Object {
    constructor() { super(); this.sounds = []; this.streams = {}; this.nextStream = 1; this.master = null; }
    $init$I$I$I() { return this; }
    load$Context$I$I(ctx, resId) { const name = $RES.raw && $RES.raw[resId]; this.sounds.push(name ? name.replace(/\.[^.]+$/, "") : null); return this.sounds.length; }
    play$I$F$F$I$I$F(id, lv, rv, prio, loop, rate) {
      const ac = actx; const buf = G.$assets && G.$assets.audio && G.$assets.audio[this.sounds[id - 1]];
      if (!ac || !buf || ac.state !== "running") return 0;
      const src = ac.createBufferSource(); src.buffer = buf; src.playbackRate.value = rate > 0 ? rate : 1;
      const g = ac.createGain(); g.gain.value = Math.max(0, (lv + rv) / 2); src.connect(g); g.connect(ac.destination);
      if (loop !== 0) src.loop = true;
      const sid = this.nextStream++; this.streams[sid] = src; src.onended = () => { delete this.streams[sid]; };
      src.start(0); return sid;
    }
    stop$I(s) { const x = this.streams[s]; if (x) { try { x.stop(); } catch (e) { } } }
    pause$I() { } resume$I() { } setVolume$I$F$F() { } setLoop$I$I() { } setRate$I$F() { } autoPause$() { } autoResume$() { }
    release$() { for (const k of Object.keys(this.streams)) this.stop$I(+k); this.streams = {}; }
    unload$I() { return true; }
  }
  defClass(android_media_SoundPool, "android.media.SoundPool");
  class android_media_MediaPlayer extends java_lang_Object {
    constructor() { super(); this.el = null; }
    static create$Context$I(ctx, resId) {
      const name = $RES.raw && $RES.raw[resId]; if (!name) return null;
      const p = new android_media_MediaPlayer();
      p.el = G.$assets && G.$assets.music && G.$assets.music[name.replace(/\.[^.]+$/, "")];
      if (!p.el) { p.el = new Audio("assets/raw/" + name); }
      return p;
    }
    start$() { const pr = this.el.play(); if (pr && pr.catch) pr.catch(() => { }); }
    pause$() { this.el.pause(); } stop$() { this.el.pause(); this.el.currentTime = 0; }
    isPlaying$() { return !this.el.paused && !this.el.ended; }
    seekTo$I(ms) { try { this.el.currentTime = ms / 1000; } catch (e) { } }
    setLooping$Z(b) { this.el.loop = b; } setVolume$F$F(l, r) { this.el.volume = Math.max(0, Math.min(1, (l + r) / 2)); }
    release$() { this.el.pause(); } reset$() { } prepare$() { }
    getDuration$() { return Math.round((this.el.duration || 0) * 1000); } getCurrentPosition$() { return Math.round(this.el.currentTime * 1000); }
  }
  defClass(android_media_MediaPlayer, "android.media.MediaPlayer");
})(globalThis);
