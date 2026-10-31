# Air Attack - PC / web port

Browser port of the Android game **Air Attack** (dk.logisoft.airattack v4.52). It is a *same-code* port: the original
game logic (â‰ˆ180 obfuscated classes: physics, terrain destruction, AI, waves, menus) is machine-translated from the
decompiled Java to JavaScript, running on a small hand-written Java/Android runtime (Canvas 2D, Web Audio, localStorage).
It is not a re-implementation.

## Run it

```
python3 -m http.server -d dist 8000      # any static web server works
# open http://localhost:8000
```

Click **START** â†’ Play â†’ Easy / Hard / Bottomless / Classic.  (Works on GitHub Pages as-is: upload the contents of `dist/`.)

## Controls (PC)

| Action | Mouse | Keyboard |
|---|---|---|
| Fire a rocket | click anywhere (towards the pointer) | `Space` / `Z` |
| Walk | hold left button left/right of the soldier | `A` `D` / â† â†’ |
| Jump (double jump in the air) | swipe/drag upward | `W` / â†‘ |
| Dig | press and hold ON the soldier, drag through terrain | - |
| Pause / back | - | `Esc` |
| Menu | click buttons | â† â†’ + `Enter` |

Touch screens work too (first finger = mouse).  Tab hidden = automatic pause (like Android `onPause`).

## What is in this zip

```
dist/                     READY TO RUN site  (index.html, game-bundle.js, assets/ sprites+sounds+font)
port/overlay/             replacement Java sources for platform glue (ads, analytics, crash reporting, cloud, dialogs, view/activity)
port/patches/             targeted find/replace patches applied to the decompiled sources (see tools/apply_patches.py)
port/stubs/               compile-time Android API stubs (only used so javac can type-check the game code)
port/runtime/             JVM subset + Android API shim in JavaScript (jvm-core.js, jvm-util.js, android.js)
port/web/                 browser host: index.html, host.js (asset loading, input, frame loop, overlays)
port/seeds.txt            entry classes for the reachability walk
tools/                    Java->JS translator (Transpiler.java, JsGen.java) + build/test scripts
tools/test/               headless Playwright smoke/gameplay test (node tools/test/play.js "click:435,645;wait:1500;shot:a")
APK_ANALYSIS.md           what the game is made of and how it works
PARITY.md                 faithful-vs-changed checklist
```

Not included (on purpose): the APK and the raw decompiled sources (`port/src`).  To rebuild from scratch see below.

## Rebuild from the decompiled sources

1. Copy the JADX output folders `d/` and `dk/` into `port/src/`.
2. Put the apktool-decoded `res/` folder into `build/res-original/` and the font into `build/joystix.otf`.
3. `tools/rebuild.sh` (JDK 17+, python3, node).  Output goes to `dist/`.

Change a game behaviour by adding a patch block to `port/patches/*.txt`:

```
@@ FILE d/ccl.java
<<<<
exact text to find (must match exactly once)
====
replacement text
>>>>
```

## Pipeline

`port/src (+overlay +patches)` â†’ `tools/apply_patches.py` â†’ `build/jsrc` â†’ javac-attributed translator (`tools/Transpiler.java`,
`JsGen.java`; Java 8 level, no lambdas) â†’ `build/game.js` â†’ concatenated with `res.js` + runtime + `host.js` â†’ `dist/game-bundle.js`.

The generated code follows a naming contract (documented at the top of `JsGen.java`): methods are `name$sig1$sig2`, constructors
`$init$sigs`, static fields `S$name`, etc.  The game is stepped from the page (`GameUiController.step()`), the original 40 ms frame
pacing is honoured through `WebHost.requestSleep()`.

## Legal

Air Attack, its code, art and sounds belong to Logisoft / the original authors.  This port is a technical conversion for
personal/educational use.  Do not publish the converted game or its assets publicly without permission from the rights holder.
