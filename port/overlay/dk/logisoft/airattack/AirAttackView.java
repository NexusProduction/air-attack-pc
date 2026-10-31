package dk.logisoft.airattack;

import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.SurfaceHolder;
import d.buk;
import d.buw;
import d.bxf;
import d.bxg;
import d.bxh;
import dk.logisoft.airattack.ui.GameUiController;

/** Web port of the game view: builds the GameUiController and forwards browser input (translated by the page into MotionEvent/KeyEvent). */
public class AirAttackView {
    private final AirAttackActivity a;
    private final GameUiController b;
    private final buk c = new buk();
    private final buw e;

    public AirAttackView(AirAttackActivity airAttackActivity) {
        this.a = airAttackActivity;
        int iB = bxf.b();
        int iC = bxf.c();
        SurfaceHolder holder = new WebSurfaceHolder(iB, iC);
        bxh.a(this.a);
        bxg.a(this.a);
        this.e = new buw(this.a, this);
        this.b = new GameUiController(holder, this.a, this.c, iB, iC, this.e);
        this.e.a(this.b);
    }

    public GameUiController getThread() {
        return this.b;
    }

    public buw getMasterViewSwitcher() {
        return this.e;
    }

    public boolean onTrackballEvent(MotionEvent motionEvent) {
        return this.b.a(motionEvent);
    }

    public boolean onKeyDown(int i, KeyEvent keyEvent) {
        return this.b.a(keyEvent);
    }

    public boolean onKeyUp(int i, KeyEvent keyEvent) {
        return this.b.a(keyEvent);
    }

    public boolean onGenericMotionEvent(MotionEvent motionEvent) {
        return this.b.c(motionEvent);
    }

    public boolean onTouchEvent(MotionEvent motionEvent) {
        return this.b.b(motionEvent);
    }

    public void onWindowFocusChanged(boolean z) {
        if (!z) {
            this.b.i();
        } else {
            this.b.j();
        }
    }
}
