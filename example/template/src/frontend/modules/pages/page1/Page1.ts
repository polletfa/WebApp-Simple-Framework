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

declare let window: CustomWindow;

/**
 * Page 1
 */
export class Page1 extends PageBase {
    /**
     * Method called when the page is shown
     */
    public showPage(): void {
        window.application.layout.showRefresh(false);
        window.application.layout.show("logout-button", true);
        window.application.modules.main.dontShowFirstPage();

        const el = document.getElementById('page-1-btn');
        if(el instanceof HTMLElement) el.focus();
    }
    
    /**
     * Go to next page
     */
    public goToNextPage(): void {
        window.application.layout.showPage("keyvalue");
    }
}
