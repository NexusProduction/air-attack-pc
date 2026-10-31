package android.app;
import android.content.*; import android.view.WindowManager;
public class Activity extends ContextWrapper {
    public void runOnUiThread(Runnable r) {}
    public boolean isFinishing() { return false; }
    public void finish() {}
    public void startActivityForResult(Intent i, int code) {}
    public WindowManager getWindowManager() { return null; }
}
