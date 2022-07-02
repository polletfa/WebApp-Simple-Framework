/*****************************************************
 *
 * <!bootstrap:displayName>
 *
 * <!bootstrap:copyright>
 * License: <!bootstrap:license> (see LICENSE.md file)
 *
 *****************************************************/

import { CustomWindow } from "../../../../../framework/frontend/FrontendApplication";
import { PageBase } from "../../../../../framework/frontend/PageBase";
import { APIRequest } from '../../../../../framework/frontend/APIRequest';

declare let window: CustomWindow;

/**
 * Login using SingleUserAuthenticationAPI
 */
export class Login extends PageBase {
    /**
     * Method called when the page is shown
     */
    public showPage(): void {
        window.application.layout.showRefresh(false);
        window.application.layout.show("logout-button", false);

        const el = document.getElementById("password");
        if(el instanceof HTMLElement) el.focus();
    }
    
    /**
     * Login
     */
    public login(): void {
        const password = document.getElementById("password");
        if(password instanceof HTMLInputElement) {
            new APIRequest(window.application, "/SingleUserAuthenticationAPI/login", "pw=" + encodeURIComponent(password.value), "POST")
                .onReceiveJSON(resp => {
                    if(resp.status == "success") {
                        password.value = "";
                        window.application.refresh();
                    } else {
                        window.application.layout.showError("Unable to login", resp.error + " (" + resp.errorType + ")");
                    }
                });
        }
    }

    /**
     * Called when ENTER is pressed while inside the "password" input field
     */
    public keyPress(event: Event): void {
        if(event instanceof KeyboardEvent && event.keyCode==13) {
            this.login();
        }
    }
}
