/*****************************************************
 *
 * WebApp-Simple-Framework
 *
 * (c) 2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE.md file)
 *
 *****************************************************/

import * as http from "http";

import { Server } from "../Server";
import { APIBase } from "../APIBase";
import { DataTable } from "../DataProvider";

export class SingleUserAuthenticationAPI extends APIBase {
    private data: DataTable|undefined = undefined;
    
    constructor(server: Server) {
        super(server);
    }

    public async initModule(): Promise<void> {
        this.server.log("Create SingleUserAuthenticationAPI");
        return this.server.data.readTable("SingleUserAuthenticationAPI").then(table => { this.data = table; });
    }
    
    /**
     * Called when a new session is initialized.
     *
     * @param sessionId Session ID
     */
    public onSessionInit(sessionId: string): void {           
        sessionId;
        // todo check if password is set and set flag in session
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
            // todo: setpw
                
            case "/sua/login":
                this.login(url, sessionId, response);
                return true;
                
            case "/sua/logout":
                this.logout(sessionId, response);
                return true;

            default:
                return false; // not an API request
        }
    }

    // todo
    public login(url: URL, sessionId: string|null, response: http.ServerResponse): void {
        const pw = url.searchParams.get("pw");
        this.server.log("SingleUserAuthenticationAPI: login (pw = "+pw+")");

        sessionId; //todo
        this.sendAPIResponseSuccess(undefined, response);
    }
    
    public logout(sessionId: string|null, response: http.ServerResponse): void {
        this.server.log("SingleUserAuthenticationAPI: logout");
        if(sessionId) {
            this.server.sessionManager.deleteSession(sessionId);
        }
        this.sendAPIResponseSuccess(undefined, response);
    }
}
