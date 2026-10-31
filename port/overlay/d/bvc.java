package d;

import android.app.Activity;
import dk.logisoft.airattack.game.Game;
import dk.logisoft.airattack.game.GameStateController;

/**
 * Web port: original generated the next Game (terrain) on a background AsyncTask. JS has one thread, so the work is done
 * lazily the first time the result is requested (cei API subset used by GameStateController is kept).
 */
public class bvc {
    private final GameStateController a;
    private final int b;
    private final int c;
    private final Activity f654d;
    private Game result;
    private boolean cancelled;

    public bvc(GameStateController gameStateController, int i, int i2, Activity activity) {
        this.a = gameStateController;
        this.c = i2;
        this.b = i;
        this.f654d = activity;
    }

    public void b(Activity activity, Void... voidArr) {
    }

    /** "finished" == the game was already generated. */
    public boolean b() {
        return this.result != null;
    }

    public Game f() {
        if (this.result == null && !this.cancelled) {
            this.result = new Game(this.b, this.c, this.f654d, this.a.b);
        }
        return this.result;
    }

    public void a(boolean z) {
        this.cancelled = true;
    }
}
