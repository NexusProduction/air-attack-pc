package d;

/** Web port: crash reporter replaced by console logging (original: Crashlytics/ACRA style handler). */
public class ccp {
    public static void a(Throwable th) {
        WebHost.logError(th);
    }

    public static void a(String str) {
        WebHost.logError(new RuntimeException(str));
    }
}
