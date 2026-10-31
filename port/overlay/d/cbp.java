package d;

import android.content.Context;

/** Web port: build/device info (original reads package name, android_id, signing data). Release build, version 4.52 (code 237). */
public class cbp {
    private static cbp h = new cbp();
    public final boolean a = false;
    public final boolean b = false;
    public final int c = 237;
    public final int f707d = 237;
    public final String e = "4.52";
    public final String f = "dk.logisoft.airattack";
    public final String g = "web";

    public static cbp a() {
        return h;
    }

    public static void a(Context context, boolean z) {
        cdy.a(h.a);
    }

    public static String a(Context context) {
        return "dk.logisoft.airattack";
    }

    public boolean b() {
        return this.a;
    }

    public boolean c() {
        return this.b;
    }
}
