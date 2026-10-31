package android.graphics;
public final class Rect {
    public int left, top, right, bottom;
    public Rect() {} public Rect(int l, int t, int r, int b) {} public Rect(Rect r) {}
    public final int width() { return right - left; } public final int height() { return bottom - top; }
    public final int centerX() { return (left + right) >> 1; } public final int centerY() { return (top + bottom) >> 1; }
    public void set(int l, int t, int r, int b) {} public void set(Rect r) {}
    public boolean contains(int x, int y) { return false; } public boolean intersect(Rect r) { return false; }
    public boolean intersect(int l, int t, int r, int b) { return false; }
    public void offset(int dx, int dy) {} public boolean isEmpty() { return false; }
    public void setEmpty() {} public static boolean intersects(Rect a, Rect b) { return false; } public boolean intersects(int l, int t, int r, int b) { return false; } public void union(Rect r) {} public void inset(int dx, int dy) {}
}
