#!/usr/bin/env python3
"""Build the translator input tree:  pristine decompiled sources (port/src)  ->  + find/replace patches (port/patches/*.txt)  ->  + new/overlay files (port/overlay)

Patch file format (one or more FILE sections, each with one or more blocks):

    @@ FILE d/cdy.java
    <<<<
    exact text to find (must occur exactly once)
    ====
    replacement text
    >>>>

Run:  python3 tools/apply_patches.py            (writes build/jsrc)
"""
import os, re, shutil, sys, glob
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src, ov, pdir, out = (os.path.join(root, p) for p in ("port/src", "port/overlay", "port/patches", "build/jsrc"))
if os.path.exists(out): shutil.rmtree(out)
shutil.copytree(src, out)
# overlay files replace/add whole files
for dp, dn, fn in os.walk(ov):
    for f in fn:
        if f.endswith(".java"):
            rel = os.path.relpath(os.path.join(dp, f), ov)
            os.makedirs(os.path.dirname(os.path.join(out, rel)), exist_ok=True)
            shutil.copy(os.path.join(dp, f), os.path.join(out, rel))
# ---- generic library-constant folding (values of Android support / Play-services constants the decompiler left as names)
CONSTS = [
    (r"Api\.BaseClientBuilder\.API_PRIORITY_OTHER", "2147483647"),
    (r"GamesStatusCodes\.STATUS_REQUEST_UPDATE_PARTIAL_SUCCESS", "2000"),
    (r"ExploreByTouchHelper\.INVALID_ID", "(-2147483648)"),
    (r"SupportMenu\.CATEGORY_MASK", "(-65536)"),
    (r"SupportMenu\.USER_MASK", "65535"),
    (r"InputDeviceCompat\.SOURCE_ANY", "(-256)"),
    (r"ViewCompat\.MEASURED_STATE_MASK", "(-16777216)"),
    (r"cfv\.DEFAULT_TIMEOUT", "10000"),
    (r"\bAscii\.SI\b", "15"),
    (r"InputDeviceCompat\.SOURCE_JOYSTICK", "16777232"),
    (r"InputDeviceCompat\.SOURCE_GAMEPAD", "1025"),
    (r"InputDeviceCompat\.SOURCE_DPAD", "513"),
    (r"InputDeviceCompat\.SOURCE_KEYBOARD", "257"),
    (r"public static final Charset g = Charsets\.UTF_8;", ""),
    (r"\bStrings\.isNullOrEmpty\(([A-Za-z0-9_.]+)\)", r"(\1 == null || \1.length() == 0)"),
    (r"\bcid\.ROLL_OVER_FILE_NAME_SEPARATOR\b", '"_"'),
    (r"\b(?:MotionEventCompat|AdSize)\.[A-Z_]+ /\* (\d+) \*/", r"\1"),
]
import re as _re
for dp, dn, fn in os.walk(out):
    for f in fn:
        if not f.endswith(".java"): continue
        fp = os.path.join(dp, f)
        t = open(fp, encoding="utf-8").read(); t0 = t
        for pat, rep in CONSTS: t = _re.sub(pat, rep, t)
        t = _re.sub(r"^import (?:android\.support\.[\w.]+|com\.google\.android\.gms\.[\w.]+|io\.fabric\.[\w.]+|com\.google\.common\.base\.[\w.]+|android\.preference\.[\w.]+|android\.annotation\.[\w.]+);\n", "", t, flags=_re.M)
        # a field named R shadows the resource class R (decompiler artifact): rename the field
        if "import dk.logisoft.airattackfull.R;" in t:
            t = _re.sub(r"\bthis\.R\b(?!\.)", "this.R_f", t)
            t = _re.sub(r"^(\s*(?:private |public |protected )?(?:static )?(?:final )?(?:volatile )?[\w<>\[\]]+ )R( *[;=])", r"\1R_f\2", t, flags=_re.M)
        if t != t0: open(fp, "w", encoding="utf-8").write(t)
bad = 0
for pf in sorted(glob.glob(os.path.join(pdir, "*.txt"))):
    text = open(pf, encoding="utf-8").read()
    for m in re.finditer(r"^@@ FILE (\S+)\n(.*?)(?=^@@ FILE |\Z)", text, re.S | re.M):
        rel, body = m.group(1), m.group(2)
        path = os.path.join(out, rel)
        if not os.path.exists(path):
            print(f"PATCH ERROR {os.path.basename(pf)}: file not found {rel}"); bad += 1; continue
        data = open(path, encoding="utf-8").read()
        for b in re.finditer(r"^<<<<\n(.*?)\n====\n(.*?)\n?>>>>$", body, re.S | re.M):
            find, rep = b.group(1), b.group(2)
            n = data.count(find)
            if n != 1:
                print(f"PATCH ERROR {os.path.basename(pf)} {rel}: find-block matched {n} times:\n{find[:200]}"); bad += 1; continue
            data = data.replace(find, rep)
        open(path, "w", encoding="utf-8").write(data)
print("patched tree ready:", out, "(errors: %d)" % bad)
sys.exit(1 if bad else 0)
