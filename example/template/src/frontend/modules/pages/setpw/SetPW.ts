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
 * Set password for SingleUserAuthenticationAPI
 */
export class SetPW extends PageBase {
    /**
     * Method called when the page is shown
     */
    public showPage(): void {
        window.application.layout.showRefresh(false);
        window.application.layout.show("logout-button", false);
        window.application.layout.show("settings-button", false);
        window.application.layout.show("setpw-cancel-btn", window.application.modules.main.isLoggedIn());
        
        const el = document.getElementById("password1");
        if(el instanceof HTMLInputElement) {
            el.value = "";
            el.focus();
        }
        const el2 = document.getElementById("password2");
        if(el2 instanceof HTMLInputElement) el2.value = "";
    }
    
    /**
     * Set the password
     */
    public setPassword(): void {
        const password1 = document.getElementById("password1");
        const password2 = document.getElementById("password2");
        if(password1 instanceof HTMLInputElement && password2 instanceof HTMLInputElement) {
            if(password1.value != password2.value) {
                window.application.layout.showError("Mismatch", "You must enter the same password twice!");
            } else if(password1.value == "") {
                window.application.layout.showError("Empty password", "You must specify a password!");
            } else {
                new APIRequest(window.application, "/SingleUserAuthenticationAPI/setpw", "pw=" + encodeURIComponent(password1.value), "POST")
                    .onReceiveJSON(resp => {
                        if(resp.status == "success") {
                            window.application.refresh();
                        } else {
                            window.application.layout.showError("Unable to set the password", resp.error + " (" + resp.errorType + ")");
                        }
                    });
            }
        }
    }
}
