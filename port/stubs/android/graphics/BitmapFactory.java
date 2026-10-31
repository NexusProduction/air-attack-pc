package android.graphics;
import android.content.res.Resources;
public class BitmapFactory {
    public static class Options {
        public boolean inScaled = true; public boolean inDither; public boolean inPurgeable; public boolean inInputShareable;
        public Bitmap.Config inPreferredConfig; public int inSampleSize = 1; public int inDensity; public int inTargetDensity;
        public boolean inJustDecodeBounds; public int outWidth; public int outHeight; public boolean inMutable;
    }
    public static Bitmap decodeResource(Resources r, int id) { return null; }
    public static Bitmap decodeResource(Resources r, int id, Options o) { return null; }
}
