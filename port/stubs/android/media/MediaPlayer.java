package android.media;
import android.content.Context;
public class MediaPlayer {
    public static MediaPlayer create(Context c, int resId) { return null; }
    public void start() {} public void stop() {} public void pause() {} public void release() {} public void reset() {}
    public void setLooping(boolean b) {} public boolean isPlaying() { return false; }
    public void setVolume(float l, float r) {} public void seekTo(int ms) {}
    public void prepare() {} public int getDuration() { return 0; } public int getCurrentPosition() { return 0; }
}
