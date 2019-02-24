import { join, parse } from 'path'
import { get } from 'https'
import { createWriteStream, mkdirSync, existsSync, chmodSync } from 'fs'

export const binName = `node-watcher_${process.platform}_${process.arch}${process.platform === 'win32' ? '.exe' : ''}`
export const binPath = join(__dirname, '.bin', binName)

export function downloadBinary(from: string) {
  return new Promise((resolve, reject) => {
    const req = get(from)
    req.on('response', res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadBinary(res.headers.location)
          .then(resolve)
          .catch(reject)
      }
      let dir = parse(binPath).dir
      if (!existsSync(dir)) mkdirSync(parse(binPath).dir)
      res.pipe(createWriteStream(binPath)).on('close', () => {
        chmodSync(binPath, '0775')
        resolve(true)
      })
    })
    req.on('error', reject)
    req.end()
  })
}
