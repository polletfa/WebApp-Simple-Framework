/*****************************************************
 *
 * WebApp-Simple-Framework
 *
 * (c) 2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE.md file)
 *
 *****************************************************/

import { ServerConfig } from "./types/Config";

export class Constants {
    /**
     * Location of the default configuration file when none is provided as command line parameter
     */
    static readonly CONFIG_FILE = "config.yml";

    /**
     * Frontend
     */
    static readonly FRONTEND_HTML = "frontend/index.html";

    /**
     * Favicon
     */
    static readonly FRONTEND_FAVICON = "frontend/favicon.svg";
    
    /**
     * Marker for the configuration passed to the frontend
     */
    static readonly FRONTEND_MARKER = "<!FrontendConfig>";

    /**
     * Default configuration
     */
    static readonly DEFAULT_CONFIG: ServerConfig = {
        name: "default",
        
        port: 8080,
        sessionMaxIdle: 24*60*60*1000,
        logHeaders: false,
        data: "./data",
        
        ssl: {
            cert: "",
            key: ""
        },
        allowInsecure: false,
        requireHostname: ""
    };

}
