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

import { Redirect } from "./modules/Redirect";
import { SingleUserAuthenticationAPI } from "./modules/SingleUserAuthenticationAPI";

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
    constructor(modules: (ServerModuleFactoryFunction|string)[]) {
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

            // Prepare modules
            const preparedModules = [];
            for(const mod of modules) {
                if(typeof mod === "string") {
                    // Built-in modules
                    const modParsed = mod.split(":");
                    let isBuiltin = false;
                    let isValid = false;
                    
                    switch(modParsed[0]) {
                        case "SingleUserAuthenticationAPI":
                            isBuiltin = true;
                            isValid = modParsed.length === 1;
                            preparedModules.push((server:Server) => new SingleUserAuthenticationAPI(server));
                            break;

                        case "Redirect":
                            isBuiltin = true;
                            isValid = modParsed.length === 2;
                            preparedModules.push((server:Server) => new Redirect(server, modParsed[1].split(",")));
                            break;

                        default:
                            break;
                    }

                    if(isBuiltin) {
                        if(isValid) {
                            this.log("Using built-in module: "+modParsed[0]);
                        } else {
                            this.log("Invalid syntax for built-in module: "+modParsed[0]);
                        }
                    } else {
                        this.log("Unknown built-in module: " + modParsed[0]);
                    }
                } else {
                    // Custom module
                    this.log("Using custom module");
                    preparedModules.push(mod);
                }
            }

            // Start servers
            this.log("Starting server"+plural+" on port"+plural+": "+config.map(server => server.port).join(", "));
            this.log("---");
            this.startServers(config, preparedModules);
        } catch(e) {
            this.die(e instanceof Error ? e : new Error(String(e)));
        }
    }

    protected async startServers(config: ServerConfig[], modules: ServerModuleFactoryFunction[]): Promise<void> {
        for(const server of config) {
            // Initialize and launch HTTP/HTTPS server
            await (new Server(this, modules, server)).run()
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
