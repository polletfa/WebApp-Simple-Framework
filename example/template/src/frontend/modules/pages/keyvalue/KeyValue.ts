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
import { APIRequest } from "../../../../../framework/frontend/APIRequest";

import { isAPIResponse } from "../../../../../framework/backend/types/API";
import { isSampleKeyValueAPIList, SampleKeyValueAPIList } from "../../../../backend/types/SampleKeyValueAPI";

declare let window: CustomWindow;

/**
 * Page to view and edit the data from the SampleKeyValueAPI
 */
export class KeyValue extends PageBase {
    /**
     * Method called when the page is shown
     */
    public showPage(): void {
        window.application.layout.showRefresh(true);
        window.application.layout.show("logout-button", true);

        window.application.modules.editKeyValue.onValidate((key:string,value:string) => {
            new APIRequest(window.application, "/SampleKeyValueAPI/set", "k="+encodeURIComponent(key)+"&v="+encodeURIComponent(value), "GET")
                .onReceiveJSON(window.application.modules.keyvalue.showPage);
        });

        new APIRequest(window.application, "/SampleKeyValueAPI/list", "", "GET")
            .onReceiveJSON(resp => {
                const isValid = isAPIResponse(resp);
                const isSuccessful = isValid && resp.status == "success";
                const hasValidPayload = isSuccessful  && isSampleKeyValueAPIList(resp.data);

                if(hasValidPayload) {
                    window.application.modules.keyvalue.refreshTable(resp.data);
                } else {
                    window.application.modules.KeyValue.refreshTable([]);
                    const detail = isValid && !isSuccessful
                        ? "The backend responded with an error: "+resp.error +" ("+resp.errorType+")"
                        : "The response has not the expected format: "+JSON.stringify(resp);

                    window.application.layout.showError("Unable to retrieve data from the backend", detail);
                }
            });
    }

    public refreshTable(data: SampleKeyValueAPIList): void {
        const el = document.getElementById("keyvalue-table");
        if(el instanceof HTMLElement) {
            let str = '';
            for(const kv of data) {
                str += '<tr>'
                    +'<td>' + window.application.layout.escapeHTML(kv.key) + '</td>'
                    +'<td>' + window.application.layout.escapeHTML(kv.value) + '</td>'
                    +'<td><button type="button" class="btn btn-dark col-12" onclick="window.application.modules.keyvalue.editValue(\'' + window.application.layout.escapeSingleQuote(kv.key) + '\',\''
                    +window.application.layout.escapeSingleQuote(kv.value) + '\');">Edit</button></td>'
                    +'<td><button type="button" class="btn btn-dark col-12" onclick="window.application.modules.keyvalue.unsetValue(\'' + window.application.layout.escapeSingleQuote(kv.key) + '\');">Delete</button></td>'
                    +'</tr>';
            }
            el.innerHTML = str;
        }
    }

    public unsetValue(key: string): void {
        new APIRequest(window.application, "/SampleKeyValueAPI/unset", "k="+encodeURIComponent(key), "GET")
            .onReceiveJSON(this.showPage);
    }

    public newValue(): void {
        window.application.modules.editKeyValue.openDialog("create");
    }

    public editValue(key: string, value: string): void {
        window.application.modules.editKeyValue.openDialog("edit", key, value);
    }
}
