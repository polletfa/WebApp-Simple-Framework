/*****************************************************
 *
 * <!bootstrap:displayName>
 *
 * <!bootstrap:copyright>
 * License: <!bootstrap:license> (see LICENSE.md file)
 *
 *****************************************************/

import { Modal } from "bootstrap";

/**
 * Dialog "Add value"
 */
export class EditKeyValue {
    protected onValidateHandler: ((key: string, value: string)=>void)|undefined = undefined;

    public onValidate(handler: (key: string, value: string)=>void): void {
        this.onValidateHandler = handler;
    }

    public openDialog(mode: "edit"|"create", key?: string, value?: string): void {
        this.toggleDialog();
        this.setMode(mode, key, value);
    }
    
    public saveValue(): void {
        if(this.onValidateHandler) {
            const elkey = document.getElementById("editKeyValue-key");
            const elvalue = document.getElementById("editKeyValue-value");
            if(elkey instanceof HTMLInputElement && elvalue instanceof HTMLInputElement) {
                this.onValidateHandler(elkey.value, elvalue.value);
            }
        }
        this.toggleDialog();
    }

    private toggleDialog(): void {
        const el = document.getElementById("editKeyValue");
        if(el instanceof HTMLElement) {
            Modal.getOrCreateInstance(el).toggle();
        }
    }

    private setMode(mode: "edit"|"create", key?: string, value?: string): void {
        const eltitle = document.getElementById("editKeyValue-title");
        const elkey = document.getElementById("editKeyValue-key");
        const elvalue = document.getElementById("editKeyValue-value");

        if(mode == "edit") {
            if(eltitle instanceof HTMLElement) eltitle.innerHTML = "Edit value";
            if(elkey instanceof HTMLInputElement) {
                elkey.value = key || "";
                elkey.disabled = true;
            }
            if(elvalue instanceof HTMLInputElement) {
                elvalue.value = value || "";
                elvalue.focus();
            }
        } else {
            if(eltitle instanceof HTMLElement) eltitle.innerHTML = "Create value";
            if(elkey instanceof HTMLInputElement) {
                elkey.value = "";
                elkey.disabled = false;
                elkey.focus();
            }
            if(elvalue instanceof HTMLInputElement)
                elvalue.value = "";
        }
    }    
}
