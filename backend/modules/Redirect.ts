/*****************************************************
 *
 * WebApp-Simple-Framework
 *
 * Copyright (c) 2022 Fabien Pollet <polletfa@posteo.de>
 * License: MIT (see LICENSE.md file)
 *
 *****************************************************/

import * as http from "http";

import { Server } from "../Server";
import { ServerModule } from "../ServerModule";

export class Redirect extends ServerModule {
    constructor(server: Server, private paths: string[]) {
        super(server);
    }

    public async initModule(): Promise<void> {
        this.server.log("Create Redirect");
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
        sessionId; // not needed
        if(this.paths.some(i => url.pathname === "/"+i || url.pathname === "/" + i + "/")) {
            response.statusCode = 301;
            const redirectTarget = "/?" +(url.pathname.slice(-1) === "/" ? url.pathname.slice(1,-1) : url.pathname.slice(1));
            this.server.log("Redirect " + url.pathname+ " -> " + redirectTarget);
            response.setHeader("Location", redirectTarget);
            response.end();
            return true;
        }
        return false; // not handled by this module
    }

    /**
     * Handle an error - not supported by this module
     * @return False
     */
    public handleError(_unused1: number, _unused2: string, _unused3: http.ServerResponse): boolean {
        _unused1;
        _unused2;
        _unused3;
        return false;
    }

}
