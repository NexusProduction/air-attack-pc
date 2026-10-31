package android.graphics;
public final class Bitmap {
    public enum Config { ALPHA_8, ARGB_4444, ARGB_8888, RGB_565 }
    public static Bitmap createBitmap(int w, int h, Config c) { return null; }
    public static Bitmap createBitmap(Bitmap src, int x, int y, int w, int h) { return null; }
    public static Bitmap createBitmap(Bitmap src, int x, int y, int w, int h, Matrix m, boolean filter) { return null; }
    public static Bitmap createBitmap(int[] colors, int w, int h, Config c) { return null; }
    public static Bitmap createScaledBitmap(Bitmap src, int w, int h, boolean filter) { return null; }
    public int getWidth() { return 0; } public int getHeight() { return 0; }
    public int getPixel(int x, int y) { return 0; } public void setPixel(int x, int y, int c) {}
    public void getPixels(int[] p, int off, int stride, int x, int y, int w, int h) {}
    public void setPixels(int[] p, int off, int stride, int x, int y, int w, int h) {}
    public void eraseColor(int c) {}
    public void recycle() {} public boolean isRecycled() { return false; }
    public boolean isMutable() { return true; } public Config getConfig() { return null; }
    public Bitmap copy(Config c, boolean mutable) { return null; }
    public void setHasAlpha(boolean b) {} public boolean hasAlpha() { return true; }
    public int getRowBytes() { return 0; } public int getByteCount() { return 0; }
}
