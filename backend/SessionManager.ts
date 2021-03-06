/*****************************************************
 *
 * WebApp-Simple-Framework
 *
 * (c) 2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE.md file)
 *
 *****************************************************/

import * as uuid from "uuid";
import * as http from "http";

import { Server } from "./Server";

type Value = string|number|boolean;

interface Session {
    id: string,
    lastUsed: number;
    data: {[key: string]: Value};
}

export class SessionManager {
    protected server: Server;
    protected sessions: Session[] = [];

    constructor(server: Server) {
        this.server = server;
        setInterval(this.clearOldSessions.bind(this), Math.min(60*1000, this.server.config.sessionMaxIdle)); // delete unused sessions regularly
    }
    
    public getOrCreateSession(request: http.IncomingMessage, response: http.ServerResponse): string {
        const cookie = request.headers?.cookie;
        if(cookie) {
            const regexStr = '\\bsessionId'+this.server.config.port+'\\s*=\\s*([^\\s;]*)'; 
            const match = cookie.match(regexStr);
            if(match) {
                // session cookie found
                if(this.hasSession(match[1])) {
                    // session exists
                    this.server.log("Using existing session: "+match[1]);
                    return match[1];
                } else {
                    this.server.log("Invalid session: "+match[1]);
                }
            }
        }
        // no cookie - Create new session and set cookie
        const sessionId = this.newSession();
        response.setHeader('Set-Cookie', 'sessionId'+this.server.config.port+'='+sessionId+'; Path=/; SameSite=Strict');
        return sessionId;
    }
    
    public newSession(): string {
        const session = {
            id: uuid.v4(),
            lastUsed: Date.now(),
            data: {}
        };
        this.sessions.push(session);
        this.server.log("Created new session: "+session.id);
        this.server.modules.forEach(mod => mod.onSessionInit(session.id));
        return session.id;
    }

    public deleteSession(sessionId: string): void {
        this.sessions = this.sessions.filter((session:Session) => session.id != sessionId);
        this.server.log("Deleted session "+sessionId);
    }

    public hasSession(sessionId: string): boolean {
        return this.sessions.find((session:Session) => session.id == sessionId) != undefined;
    }
    
    public getValue(sessionId: string, key: string): Value|undefined {
        const session = this.sessions.find((session:Session) => session.id == sessionId);
        if(session) {
            session.lastUsed = Date.now();
            if(key in session.data) {
                return session.data[key];
            } else {
                this.server.log("Session "+sessionId+": key '"+key+"' not found.");
                return undefined;
            }
        } else {
            this.server.log("Session "+sessionId+" not found.");
            return undefined;
        }
    }

    public setValue(sessionId: string, key: string, value: Value): boolean {
        const session = this.sessions.find((session:Session) => session.id == sessionId);
        if(session) {
            session.lastUsed = Date.now();
            session.data[key] = value;
            this.server.log("Session "+sessionId+": '"+key+"' => '"+value+"'");
            return true;
        } else {
            this.server.log("Session "+sessionId+" not found.");
            return false;
        }
    }

    public setValueForAllSessions(key: string, value: Value): void {
        this.sessions.forEach((session:Session) => this.setValue(session.id, key, value));
    }

    public clearOldSessions() {
        const nSessions = this.sessions.length;
        this.sessions = this.sessions.filter((session: Session) => session.lastUsed - Date.now() < this.server.config.sessionMaxIdle);
        if(this.sessions.length < nSessions) {
            this.server.log("Deleted " + (nSessions - this.sessions.length) + " session(s).");
        }
    }
}
