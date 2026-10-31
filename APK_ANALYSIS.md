# Air Attack (dk.logisoft.airattack, v4.52) - analysis

**Platform/engine**: plain Android, no game engine.  One `SurfaceView` drawn with the Canvas 2D API (`lockCanvas`/`unlockCanvasAndPost`),
game thread with a fixed 40 ms tick (25 FPS).  Code is ProGuard-obfuscated (`d.*` ≈ 2100 classes incl. libraries; `dk.logisoft.*` readable).

| Area | Classes | Notes |
|---|---|---|
| Entry | `AirAttackApplication`, `AirAttackActivity`, `AirAttackView` | activity creates the view + `GameUiController` |
| Loop / UI | `GameUiController` (thread), `GameStateController` (WELCOME / PLAYING / PLAYING_WAVE_READY / GAMEOVER), `buw` (view switcher) | menus are drawn on the canvas as `bxm` buttons |
| World | `Game`, `bve`/`bzf` (destructible terrain: `int[]` mirror + ARGB_4444 bitmap + RGB_565 composite), `bwm` (soldier), enemies/weapons `bwh` family | |
| Rendering | `bzg` (graphics scale = `max(1, screenHeight/480)`), `bxi` (sprite decoding with density scaling), `byl` (menu renderer) | |
| Input | `bzq` keys (DPAD 19/20/21/22, A=96, BACK=4), `bzv` touch, `bzw` touch (menu), `bzm` generic motion | gestures: tap=fire, hold=walk, swipe=jump, hold on soldier=dig |
| Audio | `bxg` (SoundPool, 25 effects), `bxh` (MediaPlayer: titlesong, gameover) | |
| Persistence | `ccj`/`cck`/`ccl` (SharedPreferences + SHA-1 anti-tamper hash via `cci`), `cbq/cbs/cbt` typed counters | |
| Not game logic (removed) | AdMob/interstitials, Firebase/cloud scores, Google Play games/billing, crash reporting, analytics, license check | |

Resources: 103 drawables (sprites resolved for a 320 dpi, 1280x720 device), 28 raw files (26 sounds, 2 loading images), 186 strings,
Joystix font.
