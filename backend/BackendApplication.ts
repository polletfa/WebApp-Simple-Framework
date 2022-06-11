/*****************************************************
 *
 * WebApp-Simple-Framework
 *
 * (c) 2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE.md file)
 *
 *****************************************************/

import * as fs from "fs";

import { ConfigHelper } from "./ConfigHelper";
import { FrontendProvider } from "./FrontendProvider";
import { Server } from "./Server";
import { ServerModuleFactoryFunction } from "./ServerModule";

import { SingleUserAuthenticationAPI } from "./apis/SingleUserAuthenticationAPI";

import { ServerConfig } from "./types/Config";

/**
 * Main class of the backend application
 */
export class BackendApplication {
    /**
     * Log function
     *
     * @param msg Message to log. A prefix with the time will be added.
     */
    public log(msg: string) {
        const logprefix = (new Date()).toISOString()+ "   ";
        console.log(logprefix + msg.split("\n").join("\n"+logprefix));
    }
    
    /**
     * Start backend application
     */
    constructor(apis: (ServerModuleFactoryFunction|string)[]) {
        try {
            // switch to the package root directory
            process.chdir(__dirname + "/..");
            
            // load metadata and print name and version
            const package_json = JSON.parse(fs.readFileSync("package.json").toString());
            this.log(package_json.displayName + " " + package_json.version);
            this.log("---");

            // Load frontend files
            FrontendProvider.loadFrontendFiles(this);
            this.log("---");

            // Read configuration
            const config = ConfigHelper.load(this);
            const plural = config.length > 1 ? "s" : "";

            // Prepare APIs
            const preparedAPIs = [];
            for(const api of apis) {
                if(api === "SingleUserAuthenticationAPI") {
                    // Built-in API
                    this.log("Using built-in API: SingleUserAuthenticationAPI");
                    preparedAPIs.push((server:Server) => new SingleUserAuthenticationAPI(server));
                } else if(typeof api === "string") {
                    // Unknown API
                    this.log("Unknown built-in API: " + api);
                } else {
                    // User-defined APIs
                    preparedAPIs.push(api);
                }
            }

            // Start servers
            this.log("Starting server"+plural+" on port"+plural+": "+config.map(server => server.port).join(", "));
            this.log("---");
            this.startServers(config, preparedAPIs);
        } catch(e) {
            this.die(e instanceof Error ? e : new Error(String(e)));
        }
    }

    protected async startServers(config: ServerConfig[], apis: ServerModuleFactoryFunction[]): Promise<void> {
        for(const server of config) {
            // Initialize and launch HTTP/HTTPS server
            await (new Server(this, apis, server)).run()
                .catch((e:Error) => this.die(e));
            this.log("---");
        }
    }

    public die(error: Error) {
        this.log("");
        this.log("FATAL: Unable to launch the backend.");
        this.log(error instanceof Error ? ("FATAL: " + error.message) : "");
        process.exit(1);
    }
}
