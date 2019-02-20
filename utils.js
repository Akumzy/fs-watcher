"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const https_1 = require("https");
const fs_1 = require("fs");
exports.binName = `node-fs-watcher_${process.platform}_${process.arch}${process.platform === 'win32' ? '.exe' : ''}`;
exports.binPath = path_1.join(__dirname, 'bin', exports.binName);
function downloadBinary(from) {
    return new Promise((resolve, reject) => {
        const req = https_1.get(from);
        req.on('response', res => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return downloadBinary(res.headers.location)
                    .then(resolve)
                    .catch(reject);
            }
            fs_1.mkdirSync(exports.binPath);
            res.pipe(fs_1.createWriteStream(path_1.join(exports.binPath, exports.binName))).on('close', resolve);
        });
        req.on('error', reject);
        req.end();
    });
}
exports.downloadBinary = downloadBinary;
