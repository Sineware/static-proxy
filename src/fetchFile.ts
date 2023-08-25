import { isBinaryFile } from "arraybuffer-isbinary"
import axios from 'axios';
import * as nodePath from 'node:path';
import * as fs from 'node:fs';
import { upstream, upstreamInternalUrl, hostUrl } from "./consts";

export async function htmlUrlRewriter(html: string) {
    let result = html.toString();
    if(hostUrl.startsWith("https://")) {
        // replace all http:// with https://
        result = result.replace(new RegExp("http://", 'g'), "https://");
    }
    // replace all upstream urls with host url
    result = result.replace(new RegExp(upstream, 'g'), hostUrl);
    result = result.replace(new RegExp(upstream.replace(/^https?:\/\//, ''), 'g'), hostUrl.replace(/^https?:\/\//, ''));
    
    return result;
}
export async function fetchFile(path: string) {
    try {
        let filePath = nodePath.join("public", path);
        let fileURL = new URL(`${upstreamInternalUrl == "" ? upstream : upstreamInternalUrl}${path.endsWith("index.html") ? path.replace("index.html", "") : path}`)
        console.log(`Fetching from upstream: ${upstream}${path} using href ${fileURL.href}`);
        let contents = await axios.get(fileURL.href, 
            {
                responseType: 'arraybuffer', 
                headers: {
                    "Host": new URL(upstream).host,
                    "X-FORWARDED-PROTO": "https",
                }
            }
        );
        fs.mkdirSync(nodePath.dirname(filePath), {recursive: true});
        if(isBinaryFile(contents.data)) {
            fs.writeFileSync(filePath, contents.data);
        } else {
            fs.writeFileSync(filePath, await htmlUrlRewriter(contents.data));
        }
    } catch (e: any) {
        // unlink the file if it exists
        let filePath = nodePath.join("public", path);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        throw e;
    }
}