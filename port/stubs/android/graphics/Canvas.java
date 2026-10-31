package android.graphics;
public class Canvas {
    public Canvas() {} public Canvas(Bitmap b) {}
    public int getWidth() { return 0; } public int getHeight() { return 0; }
    public void drawBitmap(Bitmap b, float l, float t, Paint p) {}
    public void drawBitmap(Bitmap b, Matrix m, Paint p) {}
    public void drawBitmap(Bitmap b, Rect src, Rect dst, Paint p) {}
    public void drawBitmap(Bitmap b, Rect src, RectF dst, Paint p) {}
    public void drawBitmap(int[] colors, int off, int stride, int x, int y, int w, int h, boolean alpha, Paint p) {}
    public void drawRect(float l, float t, float r, float b, Paint p) {}
    public void drawRect(Rect r, Paint p) {} public void drawRect(RectF r, Paint p) {}
    public void drawLine(float x0, float y0, float x1, float y1, Paint p) {}
    public void drawCircle(float cx, float cy, float r, Paint p) {}
    public void drawPoint(float x, float y, Paint p) {}
    public void drawPath(Path path, Paint p) {}
    public void drawText(String t, float x, float y, Paint p) {}
    public void drawText(String t, int s, int e, float x, float y, Paint p) {}
    public void drawColor(int c) {} public void drawARGB(int a, int r, int g, int b) {} public void drawRGB(int r, int g, int b) {}
    public void drawPaint(Paint p) {}
    public int save() { return 0; } public void restore() {}
    public void translate(float dx, float dy) {} public void scale(float sx, float sy) {} public void rotate(float deg) {}
    public void rotate(float deg, float px, float py) {}
    public boolean clipRect(float l, float t, float r, float b) { return true; }
    public boolean clipRect(Rect r) { return true; }
    public void setMatrix(Matrix m) {} public void concat(Matrix m) {}
}
