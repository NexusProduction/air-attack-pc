#!/usr/bin/env python3
"""Resource packer for the web port.

Reads the original (decompiled/decoded) Android resources and produces
  dist/assets/drawable/<name>.png   sprites, resolved for the emulated device (see DEVICE_DPI / screen size 'normal')
  dist/assets/raw/<name>.ogg        sound effects + music
  dist/assets/joystix.otf           game font
  dist/res.js                       id -> value tables (strings, ints, arrays, bools, drawable/raw file maps) as `window.$RES`

Resource id -> name mapping comes from res/values/public.xml (same ids the code was compiled with).
usage: tools/build_assets.py <res-dir> <font-file> <out-dist-dir>
"""
import os, re, sys, json, shutil, xml.etree.ElementTree as ET

DEVICE_DPI = 320            # emulated xhdpi device (1280x720 @ 2.0 density); screen size bucket = "normal"
DENSITY = {"ldpi": 120, "mdpi": 160, "hdpi": 240, "xhdpi": 320, "xxhdpi": 480, "xxxhdpi": 640}

res, font, dist = sys.argv[1:4]
os.makedirs(os.path.join(dist, "assets", "drawable"), exist_ok=True)
os.makedirs(os.path.join(dist, "assets", "raw"), exist_ok=True)

# ---------------------------------------------------------------- ids
ids = {}   # (type,name) -> int
for el in ET.parse(os.path.join(res, "values", "public.xml")).getroot().iter("public"):
    ids[(el.get("type"), el.get("name"))] = int(el.get("id"), 16)

def s32(v):
    v &= 0xFFFFFFFF
    return v - (1 << 32) if v & 0x80000000 else v

def parse_int(t):
    t = t.strip()
    return s32(int(t, 16)) if t.lower().startswith(("0x", "-0x")) else int(t)

def unescape(t):
    # Android string escapes
    out, i = "", 0
    t = t.strip()
    if len(t) >= 2 and t[0] == '"' and t[-1] == '"': t = t[1:-1]
    while i < len(t):
        c = t[i]
        if c == "\\" and i + 1 < len(t):
            n = t[i + 1]
            if n == "n": out += "\n"
            elif n == "t": out += "\t"
            elif n == "u" and i + 5 < len(t) + 0:
                out += chr(int(t[i + 2:i + 6], 16)); i += 4
            else: out += n
            i += 2; continue
        out += c; i += 1
    return out

strings, ints, bools, colors, intarr, strarr = {}, {}, {}, {}, {}, {}
for fn in sorted(os.listdir(os.path.join(res, "values"))):
    if not fn.endswith(".xml") or fn == "public.xml": continue
    root = ET.parse(os.path.join(res, "values", fn)).getroot()
    for el in root:
        n = el.get("name")
        tag = el.tag
        if tag == "string":
            i = ids.get(("string", n))
            if i is not None: strings[i] = unescape("".join(el.itertext()))
        elif tag == "integer":
            i = ids.get(("integer", n))
            if i is not None: ints[i] = parse_int(el.text)
        elif tag == "bool":
            i = ids.get(("bool", n))
            if i is not None: bools[i] = el.text.strip() == "true"
        elif tag == "color":
            i = ids.get(("color", n))
            if i is not None:
                t = el.text.strip()
                if t.startswith("#"):
                    h = t[1:]
                    if len(h) == 3: h = "".join(c * 2 for c in h)
                    if len(h) == 4: h = "".join(c * 2 for c in h)
                    if len(h) == 6: h = "ff" + h
                    colors[i] = s32(int(h, 16))
        elif tag in ("array", "integer-array", "string-array"):
            i = ids.get(("array", n))
            if i is None: continue
            items = ["".join(x.itertext()) for x in el.findall("item")]
            try:
                intarr[i] = [parse_int(x) for x in items]
            except Exception:
                strarr[i] = [unescape(x) for x in items]
            if tag == "string-array": strarr[i] = [unescape(x) for x in items]

# ---------------------------------------------------------------- drawables
def candidates(dirname):
    """returns (screen_size_rank, density) for a drawable dir name or None when it can never match"""
    quals = dirname.split("-")[1:]
    size_rank, dens = 0, None
    for q in quals:
        if q in DENSITY: dens = DENSITY[q]
        elif q == "normal": size_rank = 1
        elif q == "nodpi": dens = 10000
        else: return None   # small / zh / v21 / ...: not matching the emulated device
    return size_rank, dens

best = {}   # name -> (rank tuple, path)
for d in sorted(os.listdir(res)):
    if not (d == "drawable" or d.startswith("drawable-")): continue
    c = candidates(d)
    if c is None: continue
    size_rank, dens = c
    eff = 160 if dens is None else dens          # unqualified == mdpi baseline
    for f in os.listdir(os.path.join(res, d)):
        if not f.endswith(".png") or f.endswith(".9.png"): continue
        name = f[:-4]
        # Android: higher screen-size qualifier wins; then smallest density >= requested, else the largest below it
        if eff >= DEVICE_DPI: dens_key = (0, eff)
        else: dens_key = (1, -eff)
        key = (-size_rank,) + dens_key
        if name not in best or key < best[name][0]:
            best[name] = (key, os.path.join(res, d, f), eff)

drawable_map = {}
for (t, n), i in ids.items():
    if t == "drawable" and n in best:
        drawable_map[i] = n
for n, (_, p, _e) in best.items():
    shutil.copyfile(p, os.path.join(dist, "assets", "drawable", n + ".png"))

# ---------------------------------------------------------------- raw
raw_map = {}
rawdir = os.path.join(res, "raw")
for f in os.listdir(rawdir):
    stem, ext = os.path.splitext(f)
    shutil.copyfile(os.path.join(rawdir, f), os.path.join(dist, "assets", "raw", f))
    i = ids.get(("raw", stem))
    if i is not None: raw_map[i] = f
shutil.copyfile(font, os.path.join(dist, "assets", "joystix.otf"))

drawable_density = {n: v[2] for n, v in best.items()}
table = {
    "string": strings, "integer": ints, "bool": bools, "color": colors,
    "intArray": intarr, "stringArray": strarr, "drawable": drawable_map, "drawableDensity": drawable_density, "raw": raw_map,
    "deviceDpi": DEVICE_DPI,
}
with open(os.path.join(dist, "res.js"), "w") as fh:
    fh.write("// GENERATED by tools/build_assets.py from the original Android resources\nwindow.$RES = ")
    json.dump(table, fh, separators=(",", ":"))
    fh.write(";\n")
print("drawables: %d  raw: %d  strings: %d  int arrays: %d  string arrays: %d" % (len(drawable_map), len(raw_map), len(strings), len(intarr), len(strarr)))
