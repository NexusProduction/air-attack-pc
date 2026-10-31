package dk.logisoft.airattack;

import android.graphics.Canvas;
import android.view.SurfaceHolder;
import d.WebHost;

/** Web port: the SurfaceHolder is the page's <canvas>; drawing goes straight to it, nothing to "post". */
public class WebSurfaceHolder implements SurfaceHolder {
    private final Canvas canvas;

    public WebSurfaceHolder(int i, int i2) {
        this.canvas = WebHost.createScreenCanvas(i, i2);
    }

    @Override
    public void addCallback(SurfaceHolder.Callback callback) {
    }

    @Override
    public Canvas lockCanvas() {
        return this.canvas;
    }

    @Override
    public void unlockCanvasAndPost(Canvas canvas) {
    }
}
