package android.view;
public class MotionEvent {
    public static final int ACTION_DOWN = 0; public static final int ACTION_UP = 1; public static final int ACTION_MOVE = 2; public static final int ACTION_CANCEL = 3;
    public static final int ACTION_MASK = 255; public static final int ACTION_POINTER_DOWN = 5; public static final int ACTION_POINTER_UP = 6;
    public static final int ACTION_POINTER_INDEX_MASK = 65280; public static final int ACTION_POINTER_INDEX_SHIFT = 8;
    public static final int ACTION_HOVER_MOVE = 7; public static final int ACTION_SCROLL = 8;
    public static final int AXIS_X = 0; public static final int AXIS_Y = 1; public static final int AXIS_Z = 11; public static final int AXIS_RZ = 14;
    public static final int AXIS_HAT_X = 15; public static final int AXIS_HAT_Y = 16; public static final int AXIS_LTRIGGER = 17; public static final int AXIS_RTRIGGER = 18;
    public static final int AXIS_BRAKE = 23; public static final int AXIS_GAS = 22;
    public int getAction() { return 0; } public int getActionMasked() { return 0; } public int getActionIndex() { return 0; }
    public float getX() { return 0f; } public float getY() { return 0f; } public float getX(int i) { return 0f; } public float getY(int i) { return 0f; }
    public int getPointerCount() { return 0; } public int getPointerId(int i) { return 0; } public int findPointerIndex(int id) { return 0; }
    public float getXPrecision() { return 0f; } public float getYPrecision() { return 0f; }
    public float getAxisValue(int axis) { return 0f; } public float getAxisValue(int axis, int ptr) { return 0f; }
    public int getSource() { return 0; } public int getDeviceId() { return 0; } public long getEventTime() { return 0L; }
    public InputDevice getDevice() { return null; } public float getHistoricalAxisValue(int axis, int pos) { return 0f; } public float getHistoricalAxisValue(int axis, int ptr, int pos) { return 0f; } public int getHistorySize() { return 0; } public float getHistoricalX(int pos) { return 0f; } public float getHistoricalY(int pos) { return 0f; }
}
