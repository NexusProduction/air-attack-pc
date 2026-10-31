package android.view;
public class KeyEvent {
    public static final int ACTION_DOWN = 0; public static final int ACTION_UP = 1;
    public static final int KEYCODE_BACK = 4; public static final int KEYCODE_MENU = 82; public static final int KEYCODE_DPAD_UP = 19;
    public static final int KEYCODE_DPAD_DOWN = 20; public static final int KEYCODE_DPAD_LEFT = 21; public static final int KEYCODE_DPAD_RIGHT = 22;
    public static final int KEYCODE_DPAD_CENTER = 23; public static final int KEYCODE_ENTER = 66; public static final int KEYCODE_SPACE = 62;
    public KeyEvent(int action, int code) {}
    public int getKeyCode() { return 0; } public int getAction() { return 0; } public int getRepeatCount() { return 0; }
    public int getDeviceId() { return 0; } public int getSource() { return 0; } public long getEventTime() { return 0L; }
    public int getMetaState() { return 0; } public int getUnicodeChar() { return 0; }
}
