import { isBinaryFile } from "arraybuffer-isbinary"
import axios from 'axios';
import * as nodepath from 'node:path';
import * as fs from 'node:fs';
import { upstream, hostUrl } from "./consts";

export async function htmlUrlRewriter(html: string) {
    return html.toString().replace(new RegExp(upstream, 'g'), hostUrl);
}
export async function fetchFile(path: string) {
    try {
        let filePath = `./public${path}`;
        console.log("Fetching from upstream...");
        console.log(`${upstream}${path}`);
        let contents = await axios.get(`${upstream}${path.endsWith("index.html") ? path.replace("index.html", "") : path}`, {responseType: 'arraybuffer'});
        fs.mkdirSync(nodepath.dirname(filePath), {recursive: true});
        if(isBinaryFile(contents.data)) {
            fs.writeFileSync(filePath, contents.data);
        } else {
            fs.writeFileSync(filePath, await htmlUrlRewriter(contents.data));
        }
    } catch (e: any) {
        // unlink the file if it exists
        let filePath = `./public${path}`;
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        throw e;
    }
}