package android.content;
import android.content.res.*; import android.content.pm.PackageManager;
public class Context {
    public static final int MODE_PRIVATE = 0;
    public Resources getResources() { return null; }
    public AssetManager getAssets() { return null; }
    public SharedPreferences getSharedPreferences(String name, int mode) { return null; }
    public Context getApplicationContext() { return this; }
    public Context getBaseContext() { return this; }
    public String getPackageName() { return null; }
    public Object getSystemService(String name) { return null; }
    public PackageManager getPackageManager() { return null; }
    public final String getString(int id) { return null; }
    public final String getString(int id, Object... args) { return null; }
}
