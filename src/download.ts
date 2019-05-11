import {
  downloadBinary,
  binName,
  binPath,
  cachePath,
  mkdirFallback,
  binVersion
} from "./utils";
import { existsSync, copyFileSync, chmodSync } from "fs";
import { join, parse } from "path";
(async () => {
  const from = `https://github.com/Akumzy/fs-watcher/releases/download/${binVersion}/${binName}`;
  let oldFile = join(cachePath, binName);
  if (existsSync(oldFile)) {
    mkdirFallback(parse(binPath).dir);
    copyFileSync(join(cachePath, binName), binPath);
    chmodSync(binPath, "0775");
    return;
  }
  console.log(
    `Platform: ${process.platform} Arch: ${process.arch} Download binary .....!`
  );
  console.log(
    "\x1b[32m",
    "If you wish to build the binary by yourself the source code is available in this repo https://github.com/Akumzy/fs-watcher-go"
  );
  await downloadBinary(from);
  console.log("Download completed!");
})();
