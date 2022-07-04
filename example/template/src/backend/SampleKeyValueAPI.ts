/*****************************************************
 *
 * <!bootstrap:displayName>
 *
 * <!bootstrap:copyright>
 * License: <!bootstrap:license> (see LICENSE.md file)
 *
 *****************************************************/

import * as http from "http";

import { APIBase } from "../../framework/backend/APIBase";
import { Server } from "../../framework/backend/Server";

import { SampleKeyValueAPIList, isSampleKeyValueAPIList } from "./types/SampleKeyValueAPI";

export class SampleKeyValueAPI extends APIBase {
    private data: SampleKeyValueAPIList|undefined = undefined;

    constructor(server: Server) {
        super(server);
    }

    public async initModule(): Promise<void> {
        this.server.log("Create SampleKeyValueAPI");

        return this.server.data.readTable("keyvalue").then(table => {
            if(isSampleKeyValueAPIList(table)) {
                this.data = table;
            } else throw new Error("Wrong format for DataTable keyvalue");
        });
    }

    /**
     * Called when a new session is initialized. Does nothing.
     */
    public onSessionInit(): void {
        return;
    }

    /**
     * Handle a HTTP request
     *
     * @param url Parsed URL
     * @param sessionId Session ID
     * @param response HTTP response object
     * @return True if the request is supported by the module, false otherwise
     */
    public handleRequest(url: URL, sessionId: string, response: http.ServerResponse): boolean {
        switch(url.pathname) {
            case "/SampleKeyValueAPI/get":
                if(this.checkPermission(sessionId, response)) this.getValue(url, response);
                return true;
                
            case "/SampleKeyValueAPI/set":
                if(this.checkPermission(sessionId, response)) this.setValue(url, response);
                return true;
                
            case "/SampleKeyValueAPI/unset":
                if(this.checkPermission(sessionId, response)) this.unsetValue(url, response);
                return true;

            case "/SampleKeyValueAPI/list":
                if(this.checkPermission(sessionId, response)) this.listData(response);
                return true;

            default:
                return false; // not an API request
        }
    }

    public checkPermission(sessionId: string, response: http.ServerResponse): boolean {
        if(!this.server.sessionManager.getValue(sessionId, "SingleUserAuthenticationAPI:logged_in")) {
            this.sendAPIResponseError("SampleKeyValueAPI", "Permission denied. Please login first.", response);
            return false;
        } else {
            return true;
        }
    }
    
    public getValue(url: URL, response: http.ServerResponse): void {
        if(this.data === undefined) {
            this.sendAPIResponseError("SampleKeyValueAPI", "The SampleKeyValueAPI is not initialized.", response);
        } else {
            const key = url.searchParams.get("k");
            this.server.log("SampleKeyValueAPI: GET " + key);
            if(key !== null) {
                const entry = this.data.find(i => i.key && i.key == key);
                this.server.log("SampleKeyValueAPI: entry = "+ JSON.stringify(entry));
                this.sendAPIResponseSuccess(entry !== undefined ? entry.value : undefined, response);
            } else {
                this.sendAPIResponseError("SampleKeyValueAPI", "Missing parameter (k = " + key + ")", response);
            }
        }
    }

    public setValue(url: URL, response: http.ServerResponse): void {
        if(this.data === undefined) {
            this.sendAPIResponseError("SampleKeyValueAPI", "The SampleKeyValueAPI is not initialized.", response);
        } else {
            const key = url.searchParams.get("k");
            const value = url.searchParams.get("v");
            this.server.log("SampleKeyValueAPI: SET " + key + " = " + value);
            if(key !== null && value !== null) {
                const entry = this.data.find(i => i.key && i.key == key);
                if(entry !== undefined) {
                    entry.value = value;
                    this.server.log("SampleKeyValueAPI: " + key + " updated.");
                } else {
                    this.data.push({key: key, value: value});
                    this.server.log("SampleKeyValueAPI: " + key + " inserted.");
                }
                this.server.data.writeTable("keyvalue", this.data);
                this.sendAPIResponseSuccess(undefined, response);
            } else {
                this.sendAPIResponseError("SampleKeyValueAPI", "Missing parameter(s) (k = " + key + "; v = " + value + ")", response);
            }
        }
    }

    public unsetValue(url: URL, response: http.ServerResponse): void {
        if(this.data === undefined) {
            this.sendAPIResponseError("SampleKeyValueAPI", "The SampleKeyValueAPI is not initialized.", response);
        } else {
            const key = url.searchParams.get("k");
            this.server.log("SampleKeyValueAPI: UNSET " + key);
            if(key !== null) {
                this.data = this.data.filter(i => i.key && i.key !== key);
                this.server.data.writeTable("keyvalue", this.data);
                this.sendAPIResponseSuccess(undefined, response);
            } else {
                this.sendAPIResponseError("SampleKeyValueAPI", "Missing parameter (k = " + key + ")", response);
            }
        }
    }

    public listData(response: http.ServerResponse): void {
        if(this.data === undefined) {
            this.sendAPIResponseError("SampleKeyValueAPI", "The SampleKeyValueAPI is not initialized.", response);
        } else {
            this.server.log("SampleKeyValueAPI: LIST");
            this.sendAPIResponseSuccess(this.data, response);
        }
    }
}
