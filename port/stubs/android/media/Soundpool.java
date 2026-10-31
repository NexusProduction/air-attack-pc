package android.media;
import android.content.Context;
public class SoundPool {
    public SoundPool(int maxStreams, int streamType, int srcQuality) {}
    public int load(Context c, int resId, int priority) { return 0; }
    public final int play(int soundID, float l, float r, int priority, int loop, float rate) { return 0; }
    public final void stop(int streamID) {} public final void pause(int streamID) {} public final void resume(int streamID) {}
    public final void setVolume(int streamID, float l, float r) {} public final void setLoop(int streamID, int loop) {}
    public final void setRate(int streamID, float rate) {}
    public final void release() {} public final boolean unload(int soundID) { return true; }
    public final void autoPause() {} public final void autoResume() {}
}
