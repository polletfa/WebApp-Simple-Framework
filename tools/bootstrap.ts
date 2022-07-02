/*****************************************************
 *
 * WebApp-Simple-Framework
 *
 * (c) 2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE.md file)
 *
 *****************************************************/

import * as fs from "fs";
import * as path from "path";
import { execSync }  from "child_process";

console.log("Bootstrap...");

// read package.JSON
const package_json = JSON.parse(fs.readFileSync("package.json", "utf8"));

// copy files (and replace placeholders)
function copyFolderSync(from: string, to: string) {
    try { fs.mkdirSync(to); } catch {}
    fs.readdirSync(from).forEach(element => {
        if (fs.lstatSync(path.join(from, element)).isFile()) {
            console.log("  "+path.join(to, element));
            fs.writeFileSync(path.join(to, element), fs.readFileSync(path.join(from, element), "utf8")
                .replace(/<!bootstrap:name>/g, package_json.name)
                .replace(/<!bootstrap:displayName>/g, package_json.displayName)
                .replace(/<!bootstrap:copyright_html>/g, "Copyright &copy; " + (new Date().getFullYear()) + " " + package_json.author)
                .replace(/<!bootstrap:copyright>/g, "Copyright (c) " + (new Date().getFullYear()) + " " + package_json.author)
                .replace(/<!bootstrap:license>/g, package_json.license));
        } else {
            copyFolderSync(path.join(from, element), path.join(to, element));
        }
    });
}
copyFolderSync("framework/example/template", ".");

console.log("Bootstrapped.");
