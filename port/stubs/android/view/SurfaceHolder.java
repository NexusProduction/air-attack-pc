package android.view;
import android.graphics.Canvas;
public interface SurfaceHolder {
    public interface Callback {
        void surfaceCreated(SurfaceHolder h); void surfaceChanged(SurfaceHolder h, int format, int w, int hgt); void surfaceDestroyed(SurfaceHolder h);
    }
    void addCallback(Callback c);
    Canvas lockCanvas();
    void unlockCanvasAndPost(Canvas c);
}
