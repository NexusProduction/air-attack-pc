# Parity checklist

Legend: [x] verified in headless-browser run, [~] works / not fully verified, [-] intentionally removed or replaced

## Same as the original
- [x] Main menu, mode menu (Bottomless / Easy / Hard / Random terrain), original art, font and layout (1280x720 logical screen)
- [x] Game loop and pacing (40 ms tick), waves, helicopters/planes/paratroopers, bombs, rockets, particles
- [x] Destructible terrain (craters persist, trees damaged), crashed planes as terrain
- [x] Lives HUD, wave banner, game over → score saved → back to menu → new game
- [x] Sound effects (Web Audio) and music (HTMLAudioElement) wired through the original SoundPool/MediaPlayer calls
- [x] Save data through the original preference classes (incl. SHA-1 tamper hash) stored in `localStorage`
- [~] All enemy/weapon types (nukes, napalm, gas, cluster bombs): classes are translated; not every one was seen in the short bot runs
- [~] ARGB_4444 colour quantisation of terrain bitmap (visual only)

## Changed on purpose
- [-] Touch/gesture input → mouse/keyboard mapping (see README); accelerometer control dropped
- [-] Ads, interstitials, in-app purchases, Google Play games, cloud/online highscores, crash reporting, analytics, license check
- [-] Pause menu, help pages, settings, highscores and end-of-game screen are HTML overlays instead of Android dialogs/activities
- [-] Highscores are local only (`localStorage`)
- [-] HashMap iteration order is insertion order (JS `Map`), the original's was hash order
