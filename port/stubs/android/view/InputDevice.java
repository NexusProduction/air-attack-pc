package android.view;
import java.util.List;
public final class InputDevice {
    public static final int SOURCE_CLASS_MASK = 255; public static final int SOURCE_GAMEPAD = 1025; public static final int SOURCE_JOYSTICK = 16777232;
    public static final int SOURCE_DPAD = 513; public static final int SOURCE_KEYBOARD = 257;
    public static InputDevice getDevice(int id) { return null; } public static int[] getDeviceIds() { return new int[0]; }
    public int getId() { return 0; } public int getSources() { return 0; } public String getName() { return null; }
    public MotionRange getMotionRange(int axis) { return null; } public MotionRange getMotionRange(int axis, int source) { return null; }
    public List<MotionRange> getMotionRanges() { return null; }
    public static final class MotionRange { public float getMin() { return 0f; } public float getMax() { return 0f; } public float getFlat() { return 0f; } public float getRange() { return 0f; } public int getAxis() { return 0; } }
}
