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

export type DB = {
    name: string;
    // eslint-disable-next-line
    data: any;
};

/**
 * Access to stored data
 */
export class DataProvider {
    readonly server: Server;

    constructor(server: Server) {
        this.server = server;
    }


    /**
     * Read a database
     *
     * @param name Database name
     * @return Database
     */
    public async readDB(name: string): Promise<DB> {
        return new Promise((resolve, reject) => {
            fs.readFile(this.server.config.data + "/" + name + ".json", (err: NodeJS.ErrnoException|null, data: Buffer|null) => {
                if(err) {
                    if(err.code == "ENOENT") {
                        this.server.log("Read database "+name+": empty");
                        resolve({name: name, data: {}});
                    } else {
                        this.server.log("Read database "+name+": FAILURE! (file-error)");
                        reject(err);
                    }
                } else {
                    try {
                        const json = data ? JSON.parse(data.toString()) : {};
                        this.server.log("Read database "+name);
                        resolve({name: name, data: json});
                    } catch(e) {
                        this.server.log("Read database "+name+": FAILURE! (parse-error)");
                        reject(e);
                    }
                }
            });
        });
    }

    /**
     * Write a database
     *
     * @param db Database
     * @return Promise (async)
     */
    public async writeDB(db: DB): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.writeFile(this.server.config.data + "/" + db.name + ".json", JSON.stringify(db.data), (err: Error|null) => {
                if(err) {
                    this.server.log("Write database " + db.name + ": FAILURE!");
                    reject(err);
                } else {
                    this.server.log("Write database " + db.name);
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
