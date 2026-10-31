package d;

import dk.logisoft.airattack.game.GameStateController;
import dk.logisoft.airattack.ui.GameUiController;

/**
 * Re-created javac enum switch maps for GameUiController (JADX could not emit them).
 * a: ThreadEvent  DoGoToGameover=1, GenerateNewGameInBackgroundDuringInterstitial=2, ReturnFromInterstitial=3
 * b: State        PLAYING=1, PLAYING_WAVE_READY=2 (transient, never seen by the UI loop), GAMEOVER=3, WELCOME=4
 */
public class bxy {
    public static final int[] a = new int[GameUiController.ThreadEvent.values().length];
    public static final int[] b = new int[GameStateController.State.values().length];

    static {
        a[GameUiController.ThreadEvent.DoGoToGameover.ordinal()] = 1;
        a[GameUiController.ThreadEvent.GenerateNewGameInBackgroundDuringInterstitial.ordinal()] = 2;
        a[GameUiController.ThreadEvent.ReturnFromInterstitial.ordinal()] = 3;
        b[GameStateController.State.PLAYING.ordinal()] = 1;
        b[GameStateController.State.PLAYING_WAVE_READY.ordinal()] = 2;
        b[GameStateController.State.GAMEOVER.ordinal()] = 3;
        b[GameStateController.State.WELCOME.ordinal()] = 4;
    }
}
