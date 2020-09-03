"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mkdirFallback = exports.downloadBinary = exports.cachePath = exports.binPath = exports.binName = exports.binVersion = void 0;
const https_1 = require("https");
const path_1 = require("path");
const fs_1 = require("fs");
exports.binVersion = 'v0.0.4';
exports.binName = `fs-watcher_${process.platform === 'win32' ? 'windows' : process.platform}_${process.arch}${process.platform === 'win32' ? '.exe' : ''}`;
function getUserHome() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}
exports.binPath = path_1.join(__dirname, '../bin', exports.binName);
exports.cachePath = path_1.join(getUserHome(), '.cache', 'node-watcher', exports.binVersion);
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
                mkdirFallback(path_1.parse(exports.binPath).dir);
            if (!fs_1.existsSync(exports.cachePath))
                mkdirFallback(exports.cachePath);
            res.pipe(fs_1.createWriteStream(path_1.join(exports.cachePath, exports.binName))).on('close', () => {
                fs_1.copyFileSync(path_1.join(exports.cachePath, exports.binName), exports.binPath);
                fs_1.chmodSync(exports.binPath, '0775');
                resolve(true);
            });
        });
        req.on('error', reject);
        req.end();
    });
}
exports.downloadBinary = downloadBinary;
// https://stackoverflow.com/a/40686853/10365156
function mkdirFallback(targetDir, isRelativeToScript = false) {
    if (parseInt(process.version.replace('v', '')) >= 10) {
        return fs_1.mkdirSync(targetDir, { recursive: true });
    }
    const initDir = path_1.isAbsolute(targetDir) ? path_1.sep : '';
    const baseDir = isRelativeToScript ? __dirname : '.';
    return targetDir.split(path_1.sep).reduce((parentDir, childDir) => {
        const curDir = path_1.resolve(baseDir, parentDir, childDir);
        try {
            fs_1.mkdirSync(curDir);
        }
        catch (err) {
            if (err.code === 'EEXIST') {
                // curDir already exists!
                return curDir;
            }
            // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
            if (err.code === 'ENOENT') {
                // Throw the original parentDir error on curDir `ENOENT` failure.
                throw new Error(`EACCES: permission denied, mkdir '${parentDir}'`);
            }
            const caughtErr = ['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) > -1;
            if (!caughtErr || (caughtErr && curDir === path_1.resolve(targetDir))) {
                throw err; // Throw if it's just the last created dir.
            }
        }
        return curDir;
    }, initDir);
}
exports.mkdirFallback = mkdirFallback;
