package android.graphics;
public class Matrix {
    public Matrix() {} public Matrix(Matrix m) {}
    public void reset() {} public void set(Matrix m) {}
    public void setTranslate(float dx, float dy) {} public void setScale(float sx, float sy) {} public void setScale(float sx, float sy, float px, float py) {}
    public void setRotate(float deg) {} public void setRotate(float deg, float px, float py) {}
    public boolean postTranslate(float dx, float dy) { return true; } public boolean postScale(float sx, float sy) { return true; }
    public boolean postScale(float sx, float sy, float px, float py) { return true; }
    public boolean postRotate(float deg) { return true; } public boolean postRotate(float deg, float px, float py) { return true; }
    public boolean preTranslate(float dx, float dy) { return true; } public boolean preScale(float sx, float sy) { return true; }
    public boolean preScale(float sx, float sy, float px, float py) { return true; }
    public boolean preRotate(float deg) { return true; } public boolean preRotate(float deg, float px, float py) { return true; }
    public boolean postConcat(Matrix m) { return true; } public boolean preConcat(Matrix m) { return true; }
    public void mapPoints(float[] pts) {} public void getValues(float[] v) {} public void setValues(float[] v) {}
    public float mapRadius(float r) { return r; }
}
