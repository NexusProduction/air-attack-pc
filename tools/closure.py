#!/usr/bin/env python3
"""Compute the set of Java sources reachable from seed classes (package d is flat, so same-package refs are matched by simple name).
usage: closure.py <srcdir> <overlaydir> <blocklist.txt> <seeds...>   -> prints reachable file list (relative), and blocked classes that were referenced."""
import re, os, sys
src, overlay, blockf = sys.argv[1], sys.argv[2], sys.argv[3]
seeds = sys.argv[4:]
block = set(l.split("#")[0].strip() for l in open(blockf) if l.split("#")[0].strip()) if os.path.exists(blockf) else set()
def path_of(fq):
    rel = fq.replace(".", "/") + ".java"
    for base in (overlay, src):
        p = os.path.join(base, rel)
        if os.path.exists(p): return p
    return None
dnames = {f[:-5] for f in os.listdir(os.path.join(src, "d")) if f.endswith(".java")}
for dp, dn, fn in os.walk(os.path.join(overlay, "d")):
    for f in fn:
        if f.endswith(".java"): dnames.add(f[:-5])
tok = re.compile(r'[A-Za-z_][A-Za-z0-9_$]*')
imp = re.compile(r'^import\s+(?:static\s+)?([\w.]+?)(?:\.\*)?;', re.M)
pkg = re.compile(r'^package\s+([\w.]+);', re.M)
seen, queue, blocked_hits = {}, [], {}
def add(fq, why):
    if fq in block:
        blocked_hits.setdefault(fq, set()).add(why); return
    if fq in seen: return
    p = path_of(fq)
    if not p: return
    seen[fq] = p; queue.append(fq)
for s in seeds: add(s, "seed")
i = 0
while i < len(queue):
    fq = queue[i]; i += 1
    t = open(seen[fq], encoding="utf-8", errors="replace").read()
    for m in imp.findall(t):
        # imports may be of nested classes (a.b.C.D) -> try progressively shorter
        parts = m.split(".")
        for k in range(len(parts), 1, -1):
            cand = ".".join(parts[:k])
            if path_of(cand) or cand in block:
                add(cand, fq); break
    pm = pkg.search(t)
    if pm:
        pk = pm.group(1)
        if pk == "d":
            for n in set(tok.findall(t)) & dnames:
                add("d." + n, fq)
        else:
            # same-package references for dk.* packages
            d = os.path.join(src, pk.replace(".", "/"))
            names = {f[:-5] for f in os.listdir(d)} if os.path.isdir(d) else set()
            od = os.path.join(overlay, pk.replace(".", "/"))
            if os.path.isdir(od): names |= {f[:-5] for f in os.listdir(od) if f.endswith(".java")}
            for n in set(tok.findall(t)) & names:
                add(pk + "." + n, fq)
for fq in sorted(seen): print("KEEP", fq, os.path.relpath(seen[fq], os.path.dirname(src)))
for fq in sorted(blocked_hits): print("BLOCKED", fq, "<-", ",".join(sorted(blocked_hits[fq]))[:100])
