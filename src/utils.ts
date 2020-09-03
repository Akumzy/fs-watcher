import { get } from 'https'
import { join, parse, isAbsolute, sep, resolve } from 'path'
import { createWriteStream, mkdirSync, existsSync, copyFileSync, chmodSync } from 'fs'

export const binVersion = 'v0.0.4'
export const binName = `fs-watcher_${process.platform === 'win32' ? 'windows' : process.platform}_${process.arch}${
  process.platform === 'win32' ? '.exe' : ''
}`
function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}
export const binPath = join(__dirname, '../bin', binName)
export const cachePath = join(getUserHome(), '.cache', 'node-watcher', binVersion)
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
      if (!existsSync(dir)) mkdirFallback(parse(binPath).dir)
      if (!existsSync(cachePath)) mkdirFallback(cachePath)
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
// https://stackoverflow.com/a/40686853/10365156
export function mkdirFallback(targetDir: string, isRelativeToScript = false) {
  if (parseInt(process.version.replace('v', '')) >= 10) {
    return mkdirSync(targetDir, { recursive: true })
  }
  const initDir = isAbsolute(targetDir) ? sep : ''
  const baseDir = isRelativeToScript ? __dirname : '.'

  return targetDir.split(sep).reduce((parentDir: string, childDir: string) => {
    const curDir = resolve(baseDir, parentDir, childDir)
    try {
      mkdirSync(curDir)
    } catch (err) {
      if (err.code === 'EEXIST') {
        // curDir already exists!
        return curDir
      }

      // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
      if (err.code === 'ENOENT') {
        // Throw the original parentDir error on curDir `ENOENT` failure.
        throw new Error(`EACCES: permission denied, mkdir '${parentDir}'`)
      }

      const caughtErr = ['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) > -1
      if (!caughtErr || (caughtErr && curDir === resolve(targetDir))) {
        throw err // Throw if it's just the last created dir.
      }
    }

    return curDir
  }, initDir)
}
