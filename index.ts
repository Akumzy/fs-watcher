import { binPath } from './utils'
import { access } from 'fs'
import IPC = require('ipc-node-go')
interface WatcherOption {
  duration: number
  ignoreHiddenFiles: boolean
  ignorePaths: string[]
  filters: ['create', 'remove', 'move', 'write', 'chmod', 'rename']
}
interface EventInfo {
  event: 'create' | 'remove' | 'move' | 'write' | 'chmod' | 'rename'
  fileInfo: {
    size: number
    modTime: Date
    path: string
    name: string
    oldPath?: string
    isDir: boolean
  }
}

function pathExists(path: string): Promise<boolean> {
  return new Promise(resolve => {
    access(path, (err: NodeJS.ErrnoException) => {
      if (err) resolve(false)
      else resolve(true)
    })
  })
}
class Watcher {
  private ipc = new IPC(binPath)
  constructor(private option: WatcherOption) {}
  /**
   * start
   */
  public async start(cb: (info: EventInfo) => void) {
    if (!(await pathExists(binPath))) {
      throw 'Binary file is messing. please make sure the package is installed successfully.'
    }
    const ipc = this.ipc
    ipc.init()
    ipc.once('app:ready', () => {
      ipc.send('app:user-config', this.option)
    })
    ipc.on('app:change', (info: EventInfo) => {
      if (typeof cb === 'function') cb(info)
    })
  }
  /**
   * stop
   */
  public stop() {
    this.ipc.kill()
  }
  /**
   * AddRecursive adds either a single file or directory recursively to the file list.
   * @param path path to watch
   */
  public addRecursive(path: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.ipc.sendAndReceive('app:addRecursive', path, (error, data: boolean) => {
        if (error) reject(error)
        else resolve(data)
      })
    })
  }
  /**
   * Add a single file or directory.
   * @param path path to watch
   */
  public add(path: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.ipc.sendAndReceive('app:add', path, (error, data: boolean) => {
        if (error) reject(error)
        else resolve(data)
      })
    })
  }
  /**
   * unwatch a single file or directory.
   * @param path path to unwatch
   */
  public remove(path: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.ipc.sendAndReceive('app:remove', path, (error, data: boolean) => {
        if (error) reject(error)
        else resolve(data)
      })
    })
  }
  /**
   *  RemoveRecursive removes either a single file or a directory recursively from the file's list.
   * @param path path to unwatch
   */
  public removeRecursive(path: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.ipc.sendAndReceive('app:removeRecursive', path, (error, data: boolean) => {
        if (error) reject(error)
        else resolve(data)
      })
    })
  }

  /**
   *  ignore  file or a directory.
   * @param path path to unwatch
   */
  public ignore(path: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.ipc.sendAndReceive('app:ignore', path, (error, data: boolean) => {
        if (error) reject(error)
        else resolve(data)
      })
    })
  }
}
export = Watcher
