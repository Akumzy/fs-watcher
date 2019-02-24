import { join, parse } from 'path'
import { get } from 'https'
import { createWriteStream, mkdirSync, existsSync, chmodSync, copyFileSync } from 'fs'
import pkg from './package.json'
export const binName = `node-watcher_${process.platform}_${process.arch}${process.platform === 'win32' ? '.exe' : ''}`
export const binPath = join(__dirname, '.bin', binName)
export const cachePath = join(process.env.HOME, '.cache', 'node-watcher', pkg.binVersion)
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
      if (!existsSync(cachePath)) mkdirSync(cachePath)
      res.pipe(createWriteStream(join(cachePath, binName))).on('close', () => {
        copyFileSync(join(cachePath, binName), binPath)
        chmodSync(binPath, '0775')
        resolve(true)
      })
    })
    req.on('error', reject)
    req.end()
  })
}
