/*****************************************************
 *
 * WebApp-Simple-Framework
 *
 * (c) 2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE.md file)
 *
 *****************************************************/

import * as fs from "fs";

import { Constants } from "./Constants";
import { Server } from "./Server";

// eslint-disable-next-line
type DB = {
    name: string;
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
                    if(err.code == "ENOENT") { resolve({name: name, data: {}}); }
                    else                     { reject(err); }
                } else {
                    try {
                        const json = data ? JSON.parse(data.toString()) : {};
                        resolve({name: name, data: json});
                    } catch(e) {
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
                if(err) { reject(err); }
                else    { resolve();   }
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
