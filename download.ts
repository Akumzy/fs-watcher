import { downloadBinary, binName, binPath, cachePath, mkdirFallback } from './utils'
import { existsSync, copyFileSync, chmodSync } from 'fs'
import { join, parse } from 'path'
import pkg from './package.json'
;(async () => {
  const from = `https://github.com/Akumzy/fs-watcher/releases/download/${pkg.binVersion}/${binName}`
  let oldFile = join(cachePath, binName)
  if (existsSync(oldFile)) {
    mkdirFallback(parse(binPath).dir)
    copyFileSync(join(cachePath, binName), binPath)
    chmodSync(binPath, '0775')
    return
  }
  console.log(`Platform: ${process.platform} Arch: ${process.arch} Download binary .....!`)
  await downloadBinary(from)
  console.log('Download completed!')
})()
