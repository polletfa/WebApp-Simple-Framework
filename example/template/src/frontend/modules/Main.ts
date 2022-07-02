/*****************************************************
 *
 * <!bootstrap:displayName>
 *
 * <!bootstrap:copyright>
 * License: <!bootstrap:license> (see LICENSE.md file)
 *
 *****************************************************/

import { CustomWindow } from "../../../framework/frontend/FrontendApplication";
import { APIRequest } from '../../../framework/frontend/APIRequest';

import { isSingleUserAuthenticationAPIStatus } from '../../../framework/backend/apis/SingleUserAuthenticationAPI';
import { isAPIResponse } from '../../../framework/backend/types/API';

declare let window: CustomWindow;

/**
 * Main module
 */
export class Main {
    private showFirstPage = true;
    private loggedIn = false;
    
    /**
     * Refresh application
     */
    public refresh(): void {
        new APIRequest(window.application, "/SingleUserAuthenticationAPI/status", "", "GET")
            .onReceiveJSON(resp => {
                const isValid = isAPIResponse(resp);
                const isSuccessful = isValid && resp.status == "success";
                const hasValidPayload = isSuccessful && isSingleUserAuthenticationAPIStatus(resp.data);

                if(hasValidPayload) {
                    this.loggedIn = resp.data.logged_in;
                    window.application.layout.show("settings-button", resp.data.logged_in);
                    window.application.layout.showPage(
                        !resp.data.password_set ? "setpw"
                        : !resp.data.logged_in ? "login"
                        : this.showFirstPage ? "page1"
                            : "keyvalue");
                } else {
                    const detail = isValid && !isSuccessful
                        ? "The backend responded with an error: "+resp.error +" ("+resp.errorType+")"
                        : "The response has not the expected format: "+JSON.stringify(resp);
                    window.application.layout.showError("Unable to get status from backend", detail);
                }
            });
    }

    /**
     * Return login status
     *
     * @return true/false
     */
    public isLoggedIn(): boolean { return this.loggedIn; }
    
    /**
     * Change the password
     */
    public openSettings(): void {
        window.application.layout.showPage("setpw");
    }
    
    /**
     * Logout using SingleUserAuthenticationAPI
     */
    public logout(): void {
        new APIRequest(window.application, "/SingleUserAuthenticationAPI/logout", "", "GET")
            .onFinish(window.application.refresh);
    }

    /**
     * Don't show the first page anymore
     */
    public dontShowFirstPage() : void { this.showFirstPage = false; }
}
