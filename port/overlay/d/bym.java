package d;

import dk.logisoft.airattack.AirAttackActivity;
import dk.logisoft.airattackfull.R;
import dk.logisoft.airattack.ui.GameUiController;

/**
 * Web port: the help pages (move / jump / fire / dig / hints) are an HTML overlay built by the page from the original
 * strings and background images (see port/web/host.js). h() is called by the page when the user closes the help.
 */
public class bym {
    private final GameUiController h;

    public bym(AirAttackActivity airAttackActivity, GameUiController gameUiController) {
        this.h = gameUiController;
    }

    public void a() {
        b();
    }

    public void b() {
        ccj.b().b(R.string.prefKeyShowHelpPagesDialogueHasBeenShown, true);
        WebHost.showHelp(this);
    }

    public final void h() {
        this.h.j();
        bxm.b();
    }
}
