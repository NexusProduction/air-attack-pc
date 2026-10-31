package dk.logisoft.views;

import android.app.Activity;
import d.cbp;
import d.ccf;
import d.cee;

/** Web port: base class of the game activity. Only the shared preference keys of the original survive. */
public class GameActivity extends Activity {
    public static ccf<Integer> h = ccf.b("PREF_KEY_PREVIOUS_VERSION", Integer.valueOf(cbp.a().f707d), Integer.class);
    public static String i = "prefKeyFirstVersioncodeOfThisAppSeen";
    public static ccf<Boolean> f818d = ccf.b("fullScreen", Boolean.TRUE, Boolean.class);
    public static ccf<cee> f = ccf.a("prefKeyNumberOfGamesPlayed");
    public static ccf<Integer> g = ccf.b("actStartsLocal", 0, Integer.class);
    public static final float[] j = {120.0f, 160.0f, 240.0f, 320.0f, 480.0f};

    public boolean f() {
        return true;
    }
}
