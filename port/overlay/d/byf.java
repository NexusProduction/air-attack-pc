package d;

import dk.logisoft.airattack.ui.GameUiController;

/** Web port: "Settings" menu button opens the page's settings panel (original started the Android PreferenceActivity). */
public class byf extends bxm {
    final GameUiController h;

    public byf(GameUiController gameUiController, int i, String str) {
        super(i, str);
        this.h = gameUiController;
    }

    @Override
    public void c() {
        WebHost.showSettings();
    }
}
