package d;

import dk.logisoft.airattack.AirAttackActivity;
import dk.logisoft.airattack.AirAttackView;
import dk.logisoft.airattack.ui.GameUiController;

/**
 * Web port of the "master view switcher": original juggled ad interstitials, the in-game pause view and the highscore
 * activity. Here: no ads; pause view + highscores are HTML overlays driven through WebHost.
 */
public class buw {
    private final AirAttackActivity a;
    private GameUiController b;
    private boolean f;
    private boolean g = true;

    public buw(AirAttackActivity airAttackActivity, AirAttackView airAttackView) {
        this.a = airAttackActivity;
    }

    public void a(GameUiController gameUiController) {
        this.b = gameUiController;
    }

    /** interstitial hook of the original: never shown, caller continues immediately. */
    public boolean b(boolean z) {
        return false;
    }

    private void m() {
        this.f = true;
        WebHost.showPause(this, true);
    }

    /** "Resume" button */
    public void n() {
        this.f = false;
        WebHost.showPause(this, false);
        this.b.g();
    }

    /** "Main menu" button */
    public void f() {
        this.f = false;
        WebHost.showPause(this, false);
        this.b.l();
    }

    /** Activity.onPause */
    public void g() {
        this.b.f();
        if (!this.b.n()) {
            return;
        }
        m();
    }

    /** Activity.onResume */
    public void h() {
        this.b.h();
    }

    /** Back button / Escape */
    public boolean j() {
        if (!this.g || !this.b.n()) {
            return false;
        }
        if (this.f) {
            n();
            return true;
        }
        bxg.b().h();
        this.b.f();
        m();
        return true;
    }

    public void a(int i, String str) {
        WebHost.showHighscores(i, str);
    }
}
