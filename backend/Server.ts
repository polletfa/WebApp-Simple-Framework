/*****************************************************
 *
 * WebApp-Simple-Framework
 *
 * (c) 2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE.md file)
 *
 *****************************************************/

import * as http from "http";
import * as https from "https";
import * as fs from "fs";

import { BackendApplication } from "./BackendApplication";
import { ConfigHelper } from "./ConfigHelper";
import { SessionManager } from "./SessionManager";
import { ServerModule, ServerModuleFactoryFunction } from "./ServerModule";
import { DataProvider } from "./DataProvider";
import { FrontendProvider } from "./FrontendProvider";

import { ServerConfig } from "./types/Config";

export class Server {
    readonly config: ServerConfig;
    readonly logprefix: string;
    
    readonly backend: BackendApplication;
    readonly sessionManager: SessionManager;
    readonly modules: ServerModule[];
    readonly data: DataProvider;

    readonly name: string;
    readonly protocol: string;
    readonly sslKey: string;
    readonly sslCert: string;
    readonly insecure: boolean;
    
    constructor(backend: BackendApplication, moduleFactories: ServerModuleFactoryFunction[], config: ServerConfig) {
        this.config = config;
        this.logprefix = "[" + config.name + "]   ";

        this.backend = backend;
        this.data = new DataProvider(this);
        this.sessionManager = new SessionManager(this);
        this.modules = moduleFactories.map(i => i(this)).concat(new FrontendProvider(this));

        this.log(this.config.name + " = " + ConfigHelper.serverConfigToString(config, true));
        this.name = this.config.name;
        
        // select protocol and load SSL data if required
        // HTTP is only used if both SSL options are empty. HTTP should not be started by mistake because of a misconfiguration.
        if(this.config.ssl.key.length == 0 && this.config.ssl.cert.length == 0) {
            this.protocol = "http";
            this.sslKey = "";
            this.sslCert = "";
        } else {
            // Load SSL data
            this.sslKey = fs.readFileSync(this.config.ssl.key, "utf8");
            this.sslCert = fs.readFileSync(this.config.ssl.cert, "utf8");
            this.protocol = "https";
        }
        
        this.insecure = this.securityWarning();
    }

    public log(msg: string) {
        this.backend.log(this.logprefix + msg.split("\n").join("\n"+this.logprefix));
    }

    public securityWarning(): boolean {
        if(this.protocol == "http") {
            if(this.config.allowInsecure) {
                this.log("SECURITY WARNING: SSL not configured and insecure requests allowed!");
                this.log("SECURITY WARNING: Configure HTTPS or set allow-insecure to false to disable this message and protect your data!");
                return true; // insecure
            } else {
                this.log("INFO: SSL not configured. Only localhost requests are accepted.");
            }
        }
        return false; // secure
    }
    
    public onHttpError(error: Error): void {
        this.log("ERROR: "+error.message);
    }
    
    public onHttpRequest(request: http.IncomingMessage, response: http.ServerResponse) : void {
        try {
            if(request.url) {
                this.log("---");
                this.securityWarning();
                
                this.log(JSON.stringify({
                    protocol: this.protocol,
                    host: request.headers.host,
                    method: request.method,
                    resource: request.url,
                    remoteAddress: request.socket.remoteAddress,
                    headers: this.config.logHeaders ? request.headers : undefined
                }, null, 2));

                const localhostRequest = request.socket.remoteAddress === "::ffff:127.0.0.1"
                    || request.socket.remoteAddress === "127.0.0.1"
                    || request.socket.remoteAddress === "::1";

                // handle insecure request
                if(this.protocol == "http" && !localhostRequest) {
                    if(this.config.allowInsecure) {
                        this.securityWarning();
                    } else {
                        this.log("ERROR: Remote request rejected!");
                        this.error(403, "Resource: " + request.url, response);
                        return;
                    }
                }

                // check hostname               
                if(!localhostRequest && this.config.requireHostname != "" && request.headers.host != this.config.requireHostname && request.headers.host != this.config.requireHostname+":"+this.config.port) {
                    this.log("ERROR: Remote request rejected! (wrong hostname)");
                    this.error(403, "Resource: " + request.url, response);
                    return;
                }

                // handle request
                const sessionId = this.sessionManager.getOrCreateSession(request, response);
                const urlbase = this.protocol+"://"+request.headers.host;
                let urlpath = request.url;

                if (request.method === 'POST') {
                    urlpath += urlpath.indexOf("?") < 0 ? "?" : "&";
                        
                    request.on('data', chunk => {
                        urlpath += chunk.toString();
                    });
                    request.on('end', () => {
                        this.log("end");
                        this.handleRequest(new URL(urlpath, urlbase), sessionId, response);
                    });
                } else {
                    this.handleRequest(new URL(urlpath, urlbase), sessionId, response);
                }
            } else {
                throw new Error("Invalid request - Empty URL");
            }
        } catch(error) {
            this.error(500, error instanceof Error ? error.message : "Unknown error", response);
        }
    }

    public handleRequest(url: URL, sessionId: string, response: http.ServerResponse) {
        if(!this.modules.some(mod => mod.handleRequest(url, sessionId, response))) {
            this.error(404, "Resource: "+url.pathname, response);
        }
    }
    
    public error(errorCode: number, error: string, response: http.ServerResponse) {
        this.log("ERROR: "+errorCode + " - " + error);
        try {
            if(!this.modules.some(mod => mod.handleError(errorCode, error, response))) {
                throw("No module found.");
            }
        } catch(e) {
            response.statusCode = errorCode;
            response.setHeader("Content-Type", "text/plain");
            response.end("Error " + errorCode + " - " + error + "\n"
                + "Error while trying to serve the error page: " + error);
        }
    }

    /**
     * Start the HTTP server.
     */
    public async run(): Promise<void> {
        try {
            await this.data.createDataDir();
            await Promise.all(this.modules.map(mod => mod.initModule()));
        } catch(error) {
            return Promise.reject(error);
        }
        return new Promise((resolve, reject) => {
            // Initialize and launch HTTP/HTTPS server
            this.log("Use protocol: "+this.protocol);
            const server = this.protocol == "http"
                ? http.createServer()
                : https.createServer({key: this.sslKey, cert: this.sslCert});
            server.on('error', (error: Error) => {
                this.log("ERROR: "+error.message);
                reject(error);
            });
            server.on('listening', () => {
                resolve();
            });
            server.on('request', this.onHttpRequest.bind(this));
            server.listen(this.config.port);
        });
    }
}
