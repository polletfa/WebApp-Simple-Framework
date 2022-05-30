/*****************************************************
 *
 * WebApp-Simple-Framework
 *
 * (c) 2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE.md file)
 *
 *****************************************************/

export interface SSLConfig {
    cert: string;
    key: string;
}

export interface ServerConfig {
    name: string;
    
    port: number;
    sessionMaxIdle: number;
    logHeaders: boolean;
    data: string;
    
    ssl: SSLConfig;
    allowInsecure: boolean;
    requireHostname: string;
}

/**
 * Configuration passed by the backend to the frontend.
 */
export interface FrontendConfig {
    name: string;             /**< Server name */

    statusCode: number;       /**< HTTP status code */
    error: string;            /**< Error message (if statusCode != 200) */
    insecure: boolean;        /**< Insecure configuration (live, HTTP, remote requests allowed) */
}

// eslint-disable-next-line
export function isFrontendConfig(arg: any): arg is FrontendConfig {
    if(!("name" in arg) || (typeof arg.name !== "string")
        || !("statusCode" in arg) || (typeof arg.statusCode !== "number")
        || !("error" in arg) || (typeof arg.error !== "string")
        || !("insecure" in arg) || (typeof arg.insecure !== "boolean")) return false;
    return true;
}
