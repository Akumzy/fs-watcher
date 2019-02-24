"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const https_1 = require("https");
const fs_1 = require("fs");
exports.binName = `node-watcher_${process.platform}_${process.arch}${process.platform === 'win32' ? '.exe' : ''}`;
exports.binPath = path_1.join(__dirname, '.bin', exports.binName);
function downloadBinary(from) {
    return new Promise((resolve, reject) => {
        const req = https_1.get(from);
        req.on('response', res => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return downloadBinary(res.headers.location)
                    .then(resolve)
                    .catch(reject);
            }
            let dir = path_1.parse(exports.binPath).dir;
            if (!fs_1.existsSync(dir))
                fs_1.mkdirSync(path_1.parse(exports.binPath).dir);
            res.pipe(fs_1.createWriteStream(exports.binPath)).on('close', () => {
                fs_1.chmodSync(exports.binPath, '0775');
                resolve(true);
            });
        });
        req.on('error', reject);
        req.end();
    });
}
exports.downloadBinary = downloadBinary;
