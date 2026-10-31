package android.graphics;
public class RectF {
    public float left, top, right, bottom;
    public RectF() {} public RectF(float l, float t, float r, float b) {}
    public final float width() { return right - left; } public final float height() { return bottom - top; }
    public void set(float l, float t, float r, float b) {}
}
