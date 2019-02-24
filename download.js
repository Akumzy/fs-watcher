"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const fs_1 = require("fs");
(async () => {
    const from = `https://github.com/Akumzy/node-fs-watcher-go/releases/download/v0.0.1/${utils_1.binName}`;
    if (fs_1.existsSync(utils_1.binPath)) {
        return;
    }
    console.log(`Platform: ${process.platform} Arch: ${process.arch} Download binary .....!`);
    await utils_1.downloadBinary(from);
    console.log('Download completed!');
})();
