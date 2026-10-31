package d;

import android.content.Context;

/** Web port: original also initialised logging/bitmap helpers; only the preference store matters. */
public class ccb {
    public static void a(Context context, boolean z) {
        cch.a(); // initialises the secret used by the preference anti-tamper hash (cci.a)
        ccj.a(context, z);
    }
}
