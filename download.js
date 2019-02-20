"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
(async () => {
    const from = `https://github.com/Akumzy/go-watcher/${utils_1.binName}`;
    console.log('Download binary.....!');
    await utils_1.downloadBinary(from);
    console.log('Download completed!');
})();
