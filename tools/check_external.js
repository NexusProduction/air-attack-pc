// Verifies that every external (non-translated) class/method referenced by build/game.js exists in the JS runtime.
// usage: node tools/check_external.js
const fs = require("fs"), vm = require("vm"), path = require("path");
const root = path.join(__dirname, "..");
const ctx = { console, setTimeout, clearTimeout, performance, TextEncoder, TextDecoder, Map, Set, WeakMap, Symbol, Promise, Object, Array, Number, String, Error, RegExp, parseInt, parseFloat, isNaN, Math, BigInt, Float32Array, Float64Array, Int32Array, Int16Array, Int8Array, Uint8Array, Uint8ClampedArray, Uint16Array, Uint32Array, ArrayBuffer, DataView, Date, JSON };
ctx.globalThis = ctx; ctx.window = ctx;
ctx.document = { createElement: () => ({ getContext: () => ({}) }) };
vm.createContext(ctx);
for (const f of ["dist/res.js", "port/runtime/jvm-core.js", "port/runtime/jvm-util.js", "port/runtime/android.js"]) {
  try { vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx, { filename: f }); }
  catch (e) { console.log("LOAD ERROR in " + f + ": " + e.stack.split("\n").slice(0, 4).join("\n")); process.exit(1); }
}
const lines = fs.readFileSync(path.join(root, "build/external.txt"), "utf8").split("\n");
let cls = null, missing = 0, total = 0;
const has = (C, m) => {
  for (let c = C; c && c !== Function.prototype; c = Object.getPrototypeOf(c)) {
    if (Object.prototype.hasOwnProperty.call(c, m)) return true;
    if (c.prototype && Object.prototype.hasOwnProperty.call(c.prototype, m)) return true;
  }
  return false;
};
for (const l of lines) {
  if (!l.trim()) continue;
  if (!l.startsWith(" ")) { cls = l.trim(); total++; if (!ctx[cls]) { console.log("MISSING CLASS " + cls); missing++; } continue; }
  const m = l.trim();
  const C = ctx[cls]; if (!C) continue;
  if (m.startsWith("S$")) { if (!has(C, m)) { console.log("MISSING STATIC FIELD " + cls + "." + m); missing++; } continue; }
  if (!has(C, m)) {
    // a method may be inherited via interface default or Object: check java_lang_Object too
    if (!has(ctx.java_lang_Object, m)) { console.log("MISSING " + cls + "." + m); missing++; }
  }
}
console.log("checked " + total + " classes, missing=" + missing);
