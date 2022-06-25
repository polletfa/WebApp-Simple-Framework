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

export class SingleUserAuthenticationAPI extends APIBase {
    private initialized = false;
    private password: string|undefined = undefined;

    constructor(server: Server) {
        super(server);
    }

    public async initModule(): Promise<void> {
        this.server.log("Create SingleUserAuthenticationAPI");
        return this.server.data.readTable("SingleUserAuthenticationAPI").then(data => {
            this.initialized = true;
            if(data[0] && "pw" in data[0] && typeof data[0].pw == "string") {
                this.password = data[0].pw;
            }
        });
    }
    
    /**
     * Called when a new session is initialized.
     *
     * @param sessionId Session ID
     */
    public onSessionInit(sessionId: string): void {
        this.server.log("SingleUserAuthenticationAPI: onSessionInit");

        if(!this.initialized) {
            this.server.log("The SingleUserAuthenticationAPI is not initialized");
            return;
        }

        this.server.sessionManager.setValue(sessionId, "SingleUserAuthenticationAPI:password_set", this.password !== undefined);
        this.server.sessionManager.setValue(sessionId, "SingleUserAuthenticationAPI:logged_in", false);
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
            case "/SingleUserAuthenticationAPI/status":
                this.status(sessionId, response);
                return true;
                
            case "/SingleUserAuthenticationAPI/setpw":
                this.setPassword(url, sessionId, response);
                return true;
                
            case "/SingleUserAuthenticationAPI/login":
                this.login(url, sessionId, response);
                return true;
                
            case "/SingleUserAuthenticationAPI/logout":
                this.logout(sessionId, response);
                return true;

            default:
                return false; // not an API request
        }
    }

    public status(sessionId: string, response: http.ServerResponse): void {
        this.server.log("SingleUserAuthenticationAPI: status");

        if(!this.initialized) {
            this.sendAPIResponseError("SingleUserAuthenticationAPI", "The SingleUserAuthenticationAPI is not initialized", response);
            return;
        }
        const logged_in = this.server.sessionManager.getValue(sessionId, "SingleUserAuthenticationAPI:logged_in") || false;

        this.sendAPIResponseSuccess({password_set: this.password !== undefined, logged_in: logged_in}, response);
    }
    
    public setPassword(url: URL, sessionId: string, response: http.ServerResponse): void {
        this.server.log("SingleUserAuthenticationAPI: setpw");

        if(!this.initialized) {
            this.sendAPIResponseError("SingleUserAuthenticationAPI", "The SingleUserAuthenticationAPI is not initialized", response);
            return;
        }

        const pw = url.searchParams.get("pw");
        const logged_in = this.server.sessionManager.getValue(sessionId, "SingleUserAuthenticationAPI:logged_in") || false;

        if(pw == null) {
            this.sendAPIResponseError("SingleUserAuthenticationAPI", "Missing parameter", response);
        } else if(this.password === undefined || logged_in) {
            // set password
            this.password = pw;
            this.server.data.writeTable("SingleUserAuthenticationAPI", [{pw: pw}]);
            this.server.sessionManager.setValueForAllSessions("SingleUserAuthenticationAPI:password_set", true);
            this.sendAPIResponseSuccess(undefined, response);
        } else {
            this.sendAPIResponseError("SingleUserAuthenticationAPI", "You must be logged in to set the password.", response);
        }
    }
    
    public login(url: URL, sessionId: string, response: http.ServerResponse): void {
        this.server.log("SingleUserAuthenticationAPI: login");

        if(!this.initialized) {
            this.sendAPIResponseError("SingleUserAuthenticationAPI", "The SingleUserAuthenticationAPI is not initialized", response);
            return;
        }

        const pw = url.searchParams.get("pw");
        const logged_in = this.server.sessionManager.getValue(sessionId, "SingleUserAuthenticationAPI:logged_in") || false;

        if(this.password === undefined) {
            this.sendAPIResponseError("SingleUserAuthenticationAPI", "No password set", response);
        } else if(logged_in) {
            this.sendAPIResponseError("SingleUserAuthenticationAPI", "Already logged in", response);
        } else if(pw !== this.password) {
            this.sendAPIResponseError("SingleUserAuthenticationAPI", "Invalid password", response);
        } else {
            this.server.sessionManager.setValue(sessionId, "SingleUserAuthenticationAPI:logged_in", true);
            this.sendAPIResponseSuccess(undefined, response);
        }
    }
    
    public logout(sessionId: string, response: http.ServerResponse): void {
        this.server.log("SingleUserAuthenticationAPI: logout");
        this.server.sessionManager.deleteSession(sessionId);
        this.sendAPIResponseSuccess(undefined, response);
    }
}
