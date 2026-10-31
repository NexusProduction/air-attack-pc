package android.graphics;
public class Paint {
    public static final int ANTI_ALIAS_FLAG = 1; public static final int FILTER_BITMAP_FLAG = 2; public static final int DITHER_FLAG = 4;
    public enum Style { FILL, STROKE, FILL_AND_STROKE }
    public enum Align { LEFT, CENTER, RIGHT }
    public static class FontMetrics { public float top, ascent, descent, bottom, leading; }
    public Paint() {} public Paint(int flags) {} public Paint(Paint p) {}
    public void setColor(int c) {} public int getColor() { return 0; }
    public void setAlpha(int a) {} public int getAlpha() { return 255; }
    public void setARGB(int a, int r, int g, int b) {}
    public void setStyle(Style s) {} public void setStrokeWidth(float w) {} public float getStrokeWidth() { return 0f; }
    public void setAntiAlias(boolean b) {} public void setDither(boolean b) {} public void setFilterBitmap(boolean b) {}
    public void setTextSize(float s) {} public float getTextSize() { return 0f; }
    public void setTextAlign(Align a) {} public void setTypeface(Typeface t) {}
    public Typeface getTypeface() { return null; }
    public float measureText(String t) { return 0f; }
    public float measureText(String t, int s, int e) { return 0f; }
    public float ascent() { return 0f; } public float descent() { return 0f; }
    public FontMetrics getFontMetrics() { return null; }
    public void getTextBounds(String t, int s, int e, Rect r) {}
    public PathEffect setPathEffect(PathEffect e) { return e; }
    public void setStrokeCap(Cap c) {} public enum Cap { BUTT, ROUND, SQUARE }
    public void setTextScaleX(float s) {}
    public void setFakeBoldText(boolean b) {}
    public void setXfermode(Object x) {} public void setUnderlineText(boolean b) {} public void setSubpixelText(boolean b) {} public void setLinearText(boolean b) {}
}
