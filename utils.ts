import { join } from 'path'
import { get } from 'https'
import { createWriteStream, mkdirSync } from 'fs'

export const binName = `node-fs-watcher_${process.platform}_${process.arch}${
  process.platform === 'win32' ? '.exe' : ''
}`
export const binPath = join(__dirname, 'bin', binName)

export function downloadBinary(from: string) {
  return new Promise((resolve, reject) => {
    const req = get(from)
    req.on('response', res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadBinary(res.headers.location)
          .then(resolve)
          .catch(reject)
      }
      mkdirSync(binPath)
      res.pipe(createWriteStream(join(binPath, binName))).on('close', resolve)
    })
    req.on('error', reject)
    req.end()
  })
}
