/*
    Sineware Static Proxy Server
    Copyright (C) 2023 Seshan Ravikumar

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
import 'dotenv/config'
import axios from 'axios';
import Express from 'express';
import { glob } from 'glob';
import * as fs from 'node:fs';

import { upstream, upstreamInternalUrl, upstreamPostUrl, hostUrl, port, apiKey, whitelistPaths, blacklistPaths } from "./consts";
import { fetchFile } from './fetchFile';

console.log(`- Sineware Static Proxy -
    Upstream: ${upstream}
    Upstream Internal URL: ${upstreamInternalUrl === "" ? "None" : upstreamInternalUrl}
    Upstream Post URL: ${upstreamPostUrl === "" ? "None" : upstreamPostUrl}
    Host: ${hostUrl}
    Port: ${port}
    Whitelist: ${JSON.stringify(whitelistPaths)}
    Blacklist: ${JSON.stringify(blacklistPaths)}
`);

async function main() {
    console.log("Starting server...");
    const app = Express();
    app.set('view engine', 'ejs');
    app.set('trust proxy', true);

    app.use(require('morgan')('combined'));
    app.use(async (req: any, res, next) => {
        res.setHeader("X-Powered-By", "Sineware Cloud");
        next();
    });
    app.use(async (req, res, next) => {
        // if the path contains a blacklisted path, return a 404
        for(let path of blacklistPaths) {
            if(req.path.includes(path) || decodeURI(req.path).includes(path)) {
                res.status(404).render("http-error", {
                    http_code: "404",
                    http_message: "Not Found",
                    error_message: "Blacklisted Path",
                });
                return;
            }
        }
        // if the whitelist is not empty and the path doesn't contain a whitelisted path, return a 404
        if(whitelistPaths.length > 0) {
            let found = false;
            for(let path of whitelistPaths) {
                if(req.path.includes(path) || decodeURI(req.path).includes(path)) {
                    found = true;
                    break;
                }
            }
            if(!found) {
                res.status(404).render("http-error", {
                    http_code: "404",
                    http_message: "Not Found",
                    error_message: "Path not whitelisted",
                });
                return;
            }
        }
        next();
    });
    app.use(Express.json());
    app.use(Express.urlencoded({ extended: true }));

    app.post('/sw-api/refresh', async (req, res) => {
        // bearer token auth
        if(req.header("Authorization") != `Bearer ${apiKey}`) {
            res.status(403).send(JSON.stringify({
                "status": false,
                "message": "Invalid API key"
            }));
            return;
        }
        let files = await glob("./public/**/*", {nodir: true});
        files = files.map(f => f.replace("public", ""));
        console.log(files);
        let count = 0;
        for(let file of files) {
            try {
                await fetchFile(file);
                count++;
            } catch(e: any) {
                console.log("Error fetching from upstream for " + file);
                console.log(e.message);
            }
        }
        res.send(JSON.stringify({
            "status": true,
            "message": count + " OK"
        }));
    });

    app.get('*', async (req, res) => {    
        // check if the file exists
        let path = req.path;
        if (path.endsWith("/")) {
            path += "index.html";
        }
        let filePath = `./public${path}`;
        //console.log(filePath);
        if (fs.existsSync(filePath)) {
            res.sendFile(filePath, {root: process.cwd()});
        } else {
            // if the file doesn't exist, try to fetch it from the upstream
            try {
                await fetchFile(path);
                res.sendFile(filePath, {root: process.cwd()});
            } catch(e: any) {
                console.log("Error fetching from upstream");
                console.log(e.message);
                res.status(404).render("http-error", {
                    http_code: "404",
                    http_message: "Not Found",
                    error_message: e.message,
                });
            }
        }
    });

    // Catch all post requests to handle form submissions
    app.post('*', async (req, res) => {
        console.log("POST request");
        console.log(req.path);
        console.log(req.body);

        // send to upstream post url
        if(upstreamPostUrl != "") {
            try {
                let response = await axios.post(upstreamPostUrl, req.body);
                res.send(response.data);
            } catch(e: any) {
                console.log("Error posting to upstream");
                console.log(e.message);
                res.status(500).render("http-error", {
                    http_code: "500",
                    http_message: "Internal Server Error",
                    error_message: e.message,
                });
            }
        } else {
            res.status(500).render("http-error", {
                http_code: "500",
                http_message: "Internal Server Error",
                error_message: "No upstream post url specified",
            });
        }
    });

    app.listen(port, () => {
        console.log("Listening on port " + port);
    });
}
main();