import { isBinaryFile } from "arraybuffer-isbinary"
import axios from 'axios';
import * as nodepath from 'node:path';
import * as fs from 'node:fs';
import { upstream, upstreamInternalUrl, hostUrl } from "./consts";

export async function htmlUrlRewriter(html: string) {
    let result = html.toString();
    if(hostUrl.startsWith("https://")) {
        result = result.replace(new RegExp("http://", 'g'), "https://");
    }
    result = result.replace(new RegExp(upstream, 'g'), hostUrl);
    return result;
}
export async function fetchFile(path: string) {
    try {
        let filePath = `./public${path}`;
        console.log("Fetching from upstream...");
        console.log(`${upstream}${path}`);
        let contents = await axios.get(`${upstreamInternalUrl == "" ? upstream : upstreamInternalUrl}${path.endsWith("index.html") ? path.replace("index.html", "") : path}`, {responseType: 'arraybuffer'});
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