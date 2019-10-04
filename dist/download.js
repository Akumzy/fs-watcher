"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const fs_1 = require("fs");
const path_1 = require("path");
(async () => {
    const from = `https://github.com/Akumzy/fs-watcher/releases/download/${utils_1.binVersion}/${utils_1.binName}`;
    let oldFile = path_1.join(utils_1.cachePath, utils_1.binName);
    if (fs_1.existsSync(oldFile)) {
        utils_1.mkdirFallback(path_1.parse(utils_1.binPath).dir);
        fs_1.copyFileSync(path_1.join(utils_1.cachePath, utils_1.binName), utils_1.binPath);
        fs_1.chmodSync(utils_1.binPath, "0775");
        return;
    }
    console.log(`Platform: ${process.platform} Arch: ${process.arch} Download binary .....!`);
    console.log("\x1b[32m", "If you wish to build the binary by yourself the source code is available in this repo https://github.com/Akumzy/fs-watcher-go");
    await utils_1.downloadBinary(from);
    console.log("Download completed!");
})();
