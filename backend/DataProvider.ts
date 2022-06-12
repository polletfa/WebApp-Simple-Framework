/*****************************************************
 *
 * WebApp-Simple-Framework
 *
 * (c) 2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE.md file)
 *
 *****************************************************/

import * as fs from "fs";

import { Server } from "./Server";

type Value = string|number|boolean;
export type DataTable = {[key: string]: Value}[];

/**
 * Access to stored data
 */
export class DataProvider {
    readonly server: Server;

    constructor(server: Server) {
        this.server = server;
    }

    /**
     * Read a data table
     *
     * @param name Table name
     * @return Table
     */
    public async readTable(name: string): Promise<DataTable> {
        return new Promise((resolve, reject) => {
            fs.readFile(this.server.config.data + "/" + name + ".json", (err: NodeJS.ErrnoException|null, data: Buffer|null) => {
                if(err) {
                    if(err.code == "ENOENT") {
                        this.server.log("Read table "+name+": empty");
                        resolve([]);
                    } else {
                        this.server.log("Read table "+name+": " + err);
                        reject(err);
                    }
                } else {
                    try {
                        const json = data ? JSON.parse(data.toString()) : {};
                        this.server.log("Read table "+name);
                        if(!Array.isArray(json)) throw new Error("Not a table");
                        else resolve(json);
                    } catch(e) {
                        this.server.log("Read database "+name+": " + e);
                        reject(e);
                    }
                }
            });
        });
    }

    /**
     * Write a table
     *
     * @param name Table name
     * @param table Table content
     * @return Promise (async)
     */
    public async writeTable(name:string, table: DataTable): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.writeFile(this.server.config.data + "/" + name + ".json", JSON.stringify(table), (err: Error|null) => {
                if(err) {
                    this.server.log("Write table " + name + ": FAILURE!");
                    reject(err);
                } else {
                    this.server.log("Write table " + name);
                    resolve();
                }
            });
        });
    }

    /**
     * Create the data directory if it doesn't already exist.
     *
     * @return Promise (async)
     */
    public async createDataDir(): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.mkdir(this.server.config.data, (err:NodeJS.ErrnoException|null) => {
                if(err && err.code != "EEXIST") {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}
