/*****************************************************
 *
 * WebApp-Simple-Framework
 *
 * (c) 2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE.md file)
 *
 *****************************************************/

import { FrontendApplication } from './FrontendApplication';

import { APIResponse, isAPIResponse } from '../../framework/backend/types/API';

/**
 * API request
 */
export class APIRequest {
    protected static nRequests = 0;
    
    protected ui: FrontendApplication;
    
    protected onReceiveJSONHandler: ((resp:APIResponse)=>void)|undefined = undefined;
    protected onReceiveDataHandler: ((resp:Buffer)=>void)|undefined = undefined;
    protected onFinishHandler: ((success:boolean)=>void)|undefined = undefined;

    /**
     * Create and send an API request
     *
     * @param ui Layout object
     * @param request Request URL
     * @param parameters Parameters. Added to URL for GET or sent as data for POST request.
     * @param requestType GET or POST. GET if omitted.
     */
    constructor(ui: FrontendApplication, request: string, parameters: string|undefined, requestType: "GET"|"POST") {
        this.ui = ui;
        
        new Promise<void>(() => {
            const httpRequest = new XMLHttpRequest();
            APIRequest.nRequests ++;
            let url = request;
            let postParameters: string|undefined = undefined;
            if(parameters != undefined) {
                if(requestType == "GET") {
                    url += "?" + parameters;
                } else if(requestType == "POST") {
                    postParameters = parameters;
                }
            }
            httpRequest.open(requestType, url, true);
            httpRequest.responseType = "arraybuffer";
            httpRequest.send(postParameters);
            this.ui.layout.show('loading-spinner', true);
            this.ui.layout.show('refresh-button', false);

            
            httpRequest.addEventListener("error", () => {
                this.fail("Unable to contact the backend", "XMLHttpRequest error.");
            });
            httpRequest.addEventListener("readystatechange", () => {
                if (httpRequest.readyState === httpRequest.DONE) {
                    if(httpRequest.status === 200) {
                        this.handleResponse(httpRequest.response);
                    } else {
                        this.fail("The backend responded with an error code", "Response code: "+httpRequest.status);
                    }            
                }
            });
        });
    }

    public static getActiveRequests(): number { return APIRequest.nRequests; }
    
    public onReceiveJSON(handler: (resp:APIResponse)=>void): APIRequest {
        this.onReceiveJSONHandler = handler;
        return this;
    }

    public onReceiveData(handler: (resp:Buffer)=>void): APIRequest {
        this.onReceiveDataHandler = handler;
        return this;
    }

    public onFinish(handler: ()=>void): APIRequest {
        this.onFinishHandler = handler;
        return this;
    }

    protected finalize(success = true): void {
        APIRequest.nRequests = APIRequest.nRequests > 0 ? APIRequest.nRequests -1 : 0;
        this.ui.layout.show('loading-spinner', APIRequest.nRequests > 0);
        this.ui.layout.show('refresh-button', APIRequest.nRequests == 0 && this.ui.layout.isRefreshButtonVisible());
        if(this.onFinishHandler) this.onFinishHandler(success);
    }

    protected fail(errorMessage: string, extendedMessage: string): void {
        this.ui.layout.showError(errorMessage, extendedMessage);
        this.finalize(false);
    }

    protected handleResponse(response: Buffer): void {
        this.ui.layout.show('error-banner', false);
        let json = undefined;
        // if we have a JSON handler, try parsing JSON
        if(this.onReceiveJSONHandler) {
            try {
                json = JSON.parse(new TextDecoder().decode(response)) as APIResponse;
                // send JSON
                if(isAPIResponse(json)) {
                    if(this.onReceiveJSONHandler) this.onReceiveJSONHandler(json);
                    this.finalize();
                    return;
                } else {
                    throw new Error("The response is a valid JSON but not a valid APIResponse");
                }
            } catch(e) {
                // if we don't have a data handler -> error
                if(!this.onReceiveDataHandler) {
                    this.fail("Invalid data received from backend", "Received "+response.length+" bytes. " + (e instanceof Error  ? e.message : ""));
                    return;
                }
            }
        }
        // if we have a data handler, send data
        if(this.onReceiveDataHandler) {
            this.onReceiveDataHandler(response);
        }
        this.finalize();
    }
}
