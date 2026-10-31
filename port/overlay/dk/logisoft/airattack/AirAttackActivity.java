package dk.logisoft.airattack;

import android.graphics.Typeface;
import d.bxf;
import d.bxi;
import d.bxk;
import d.bxc;
import d.bym;
import d.buw;
import d.bzi;
import d.cbp;
import d.cbq;
import d.ccb;
import d.cck;
import d.ccj;
import dk.logisoft.airattack.ui.GameUiController;
import dk.logisoft.airattackfull.R;
import dk.logisoft.views.GameActivity;

/**
 * Web port of the main activity + application object. The page creates one instance and calls boot(); everything the
 * original did in AirAttackApplication.onCreate / AirAttackActivity.onCreate / o() (without ads, cloud, crash reporting,
 * Google Play games, dialogs) happens there, in the same order.
 */
public class AirAttackActivity extends GameActivity {
    public static AirAttackActivity b = null;
    public bym a;
    public boolean c = true;
    private GameUiController l;
    private buw m;
    private AirAttackView n;
    private Typeface o;
    private boolean p = false;

    public enum Dialogs {
        EXPIRED_DIALOG,
        GO_TO_MAIN_DIALOG,
        BUY_THE_GAME_DIALOG,
        VIEW_HELP_PAGES_DIALOG,
        RATE_THE_GAME_DIALOG
    }

    /** returns the view so the page can feed it input events */
    public AirAttackView boot() {
        b = this;
        // ---- AirAttackApplication.onCreate
        cbp.a(this, false);
        ccb.a(this, false);
        bxi.a(this);
        cbq.a(this, true);
        cck cckVarB = ccj.b();
        cckVarB.a(R.string.prefKeyControls, "gestures");
        cckVarB.a(R.string.prefKeySound, true);
        cckVarB.a(R.string.prefKeyAccelerometerSensitivity, "5");
        cckVarB.a(R.string.prefKeyParticles, "2");
        cckVarB.a(R.string.prefKeyWalkShootCutoff, "300");
        // ---- AirAttackActivity.onCreate
        bxf.a(getWindowManager().getDefaultDisplay());
        this.n = new AirAttackView(this);
        this.l = this.n.getThread();
        this.m = this.n.getMasterViewSwitcher();
        this.a = new bym(this, this.l);
        this.l.a(this.a);
        // ---- AirAttackActivity.o()
        this.p = true;
        r();
        this.l.start();
        return this.n;
    }

    public void onBackPressed() {
        if (this.p) {
            this.m.j();
        }
    }

    public void onPause() {
        if (this.p) {
            this.m.g();
        }
    }

    public void onResume() {
        if (this.p) {
            this.m.h();
        }
    }

    public void a(Dialogs dialogs) {
        if (dialogs == Dialogs.GO_TO_MAIN_DIALOG) {
            this.m.f();
        }
    }

    public void b() {
    }

    public void c() {
    }

    public void r() {
        cck cckVarB = ccj.b();
        this.l.c(cckVarB.d(R.string.prefKeySound));
        bzi.a(Integer.parseInt(cckVarB.b(R.string.prefKeyWalkShootCutoff)));
        bxc.a(Float.parseFloat(cckVarB.b(R.string.prefKeyParticles)));
    }

    /** score submission after a game: handled by the page (local highscore list) through GameUiController.a(...) */
    public void a(int i) {
    }

    public Typeface d() {
        if (this.o == null) {
            this.o = Typeface.createFromAsset(getAssets(), "joystix.otf");
        }
        return this.o;
    }

    public static boolean e() {
        return false;
    }
}
