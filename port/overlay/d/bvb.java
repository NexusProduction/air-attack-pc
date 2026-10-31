package d;

import dk.logisoft.airattack.game.GameStateController;

/** Re-created javac enum switch map for GameStateController.State (JADX could not emit it): WELCOME=1, PLAYING=2, PLAYING_WAVE_READY=3, GAMEOVER=4. */
public class bvb {
    public static final int[] a = new int[GameStateController.State.values().length];

    static {
        a[GameStateController.State.WELCOME.ordinal()] = 1;
        a[GameStateController.State.PLAYING.ordinal()] = 2;
        a[GameStateController.State.PLAYING_WAVE_READY.ordinal()] = 3;
        a[GameStateController.State.GAMEOVER.ordinal()] = 4;
    }
}
