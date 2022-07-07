/*****************************************************
 *
 * WebApp-Simple-Framework
 *
 * (c) 2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE.md file)
 *
 *****************************************************/

import { Modal } from "bootstrap";

import { Layout } from '../../framework/frontend/Layout';

import { FrontendConfig, isFrontendConfig } from '../../framework/backend/types/Config';

// extend Window to add a reference to the FrontendApplication instance
export interface CustomWindow extends Window {
    application: FrontendApplication;
}
declare let window: CustomWindow;

// eslint-disable-next-line
export type ModuleList = any;

/**
 * Main class for the JavaScript logic of the website
 */
export class FrontendApplication {
    readonly config: FrontendConfig;                            /**< Configuration provided by the backend */
    readonly layout: Layout;                                    /**< Manage layout */

    public refresh: () => void;                                 /**< Function called when displaying/refreshing the page */
    public modules: ModuleList;                                 /**< List of modules */

    /**
     * @param modules Modules
     * @param refreshFunction Function called to refresh/reload the application
     */
    constructor(modules: ModuleList, refreshFunction: () => void) {
        window.application = this; // save the main class in the window object to be able to access it globally

        this.modules = modules;
        this.refresh = refreshFunction;
 
        // read config provided by backend
        const bc = document.getElementById("FrontendConfig");
        if(bc instanceof HTMLElement) {
            const loadedConf = JSON.parse(bc.innerHTML);
            if(isFrontendConfig(loadedConf)) {
                this.config = loadedConf;
            } else {
                throw new Error("FrontendConfig is invalid.");
            }
        } else {
            throw new Error("FrontendConfig not found.");
        }

        this.layout = new Layout(this);

        switch(this.config.statusCode) {
            case 200:
                this.refresh();
                break;
            case 403:
                this.layout.showError("403 Forbidden", this.config.error == "" ? "Unknown error" : this.config.error);
                break;
            case 404:
                this.layout.showError("404 Not Found", this.config.error == "" ? "Unknown error" : this.config.error);
                break;
            case 500:
                this.layout.showError("500 Internal Server Error", this.config.error == "" ? "Unknown error" : this.config.error);
                break;
            default:
                this.layout.showError("Unexpected HTTP status code "+this.config.statusCode, this.config.error == "" ? "Unknown error" : this.config.error);
                break;
        }

        if(this.config.insecure) {
            const el = document.getElementById("insecure-dialog");
            if(el instanceof HTMLElement) {
                Modal.getOrCreateInstance(el).toggle();
            }
        }
    }
}
