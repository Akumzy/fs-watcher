import { downloadBinary, binName, binPath, cachePath } from './utils'
import { existsSync, copyFileSync, chmodSync } from 'fs'
import { join } from 'path'
;(async () => {
  const from = `https://github.com/Akumzy/node-fs-watcher-go/releases/download/v0.0.2/${binName}`
  let oldFile = join(cachePath, binName)
  if (existsSync(oldFile)) {
    copyFileSync(join(cachePath, binName), binPath)
    chmodSync(binPath, '0775')
    return
  }
  console.log(`Platform: ${process.platform} Arch: ${process.arch} Download binary .....!`)
  await downloadBinary(from)
  console.log('Download completed!')
})()
