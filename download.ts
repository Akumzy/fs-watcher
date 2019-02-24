import { downloadBinary, binName, binPath } from './utils'
import { existsSync } from 'fs'
;(async () => {
  const from = `https://github.com/Akumzy/node-fs-watcher-go/releases/download/v0.0.1/${binName}`
  if (existsSync(binPath)) {
    return
  }
  console.log(`Platform: ${process.platform} Arch: ${process.arch} Download binary .....!`)
  await downloadBinary(from)
  console.log('Download completed!')
})()
