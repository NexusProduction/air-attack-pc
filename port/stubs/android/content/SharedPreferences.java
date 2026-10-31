package android.content;
import java.util.Map;
public interface SharedPreferences {
    boolean contains(String key);
    Map<String, ?> getAll();
    String getString(String key, String def);
    int getInt(String key, int def);
    long getLong(String key, long def);
    float getFloat(String key, float def);
    boolean getBoolean(String key, boolean def);
    Editor edit();
    public interface Editor {
        Editor putString(String key, String v);
        Editor putInt(String key, int v);
        Editor putLong(String key, long v);
        Editor putFloat(String key, float v);
        Editor putBoolean(String key, boolean v);
        Editor remove(String key);
        Editor clear();
        boolean commit();
        void apply();
    }
}
