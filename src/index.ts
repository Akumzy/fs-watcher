import { binPath } from './utils'
import IPC = require('ipc-node-go')
export enum Op {
  Create,
  Write,
  Remove,
  Rename,
  Chmod,
  Move
}
const OpToString: { [key: number]: string } = {
  [Op.Create]: 'create',
  [Op.Write]: 'write',
  [Op.Remove]: 'remove',
  [Op.Rename]: 'rename',
  [Op.Chmod]: 'chmod',
  [Op.Move]: 'move'
}
export interface WatcherOption {
  /**The polling interval in milliseconds. default is 100ms */
  interval: number
  /**to ignore hidden files */
  ignoreHiddenFiles: boolean
  /**Array of paths to be igored at startup */
  ignorePaths?: string[]
  /**changes to subscrib to. */
  filters?: Op[]
  /**For any reason you want to keep the binary a different location */
  binPath?: string
  /**path to watch */
  path: string
  /**If to watch the specified path recursively */
  recursive: boolean
  /**If you're ok with logging from child_process */
  debug?: boolean
  /**Only files that match the regular expression during file listings
	 will be watched.*/
  filterHooks?: {
    /**
     * reg is simply a plain regular expression pattern
     * eg:
     *  - `^~$` Good
     *  - `/^~$/` Bad.
     *  - `new RegExp('^~$')` Very bad.
     */
    reg: string
    /**If to use the file full path or just the file name */
    useFullPath: boolean
  }[]
}
interface EventInfo {
  event: Op
  fileInfo: FileInfo
}
export interface FileInfo {
  size: number
  modTime: Date
  path: string
  name: string
  oldPath?: string
  isDir: boolean
  mode?: number
}

class Watcher {
  private ipc: IPC
  constructor(private option: WatcherOption) {
    this.ipc = new IPC(option.binPath || binPath)
    if (this.option.debug) {
      this.ipc.on('log', console.log)
    }
  }
  /**
   * `start` states the watcher and return
   * all watched files and directory or error is any.
   *
   */
  public start(cb?: (err: any, info: FileInfo[]) => void): Promise<FileInfo[]> {
    return new Promise((resolve, reject) => {
      if (!binPath && !this.option.binPath) {
        let errMsg: string = 'Binary file is messing. please make sure the package is installed successfully'
        if (typeof cb === 'function') cb(errMsg, null)
        else reject(errMsg)
      }
      this.ipc.init()
      if (!this.option.interval) this.option.interval = 100
      this.ipc.once('app:ready', () => {
        this.ipc.sendAndReceive('app:start', this.option, (err, data: FileInfo[]) => {
          if (typeof cb === 'function') cb(err, data)
          else {
            if (err) reject(err)
            else resolve(data)
          }
        })
      })
    })
  }
  /**
   * This return all the watched files per cycle.
   */
  public getWatchedFiles(): Promise<FileInfo[]> {
    return new Promise((resolve, reject) => {
      this.ipc.sendAndReceive('app:getWatchedFiles', null, (error, data: FileInfo[]) => {
        if (error) reject(error)
        else resolve(data)
      })
    })
  }
  /**
   * Listen to any change event you want to.
   * @param event the name of event you want to listen to.
   * @param cb the callback function that will handler the event.
   */
  public onChange(event: 'create' | 'remove' | 'rename' | 'chmod' | 'move' | 'write', cb: (file: FileInfo) => void) {
    this.ipc.on('app:change', (info: EventInfo) => {
      if (event === OpToString[info.event]) {
        cb(info.fileInfo)
      }
    })
    return this
  }
  /**
   * `Watcher.onAll` method listens for all change events
   * @param cb is callback function that will be called on new changes
   */
  public onAll(cb: (event: string, file: FileInfo) => void) {
    this.ipc.on('app:change', (info: EventInfo) => {
      cb(OpToString[info.event], info.fileInfo)
    })
    return this
  }
  /**
   *  Once this event emits it's very likely that the `Watcher` process has been closed.
   * @param cb
   */
  public onError(cb: (error: any) => void) {
    this.ipc.on('app:error', cb)
    this.ipc.on('error', cb)
    return this
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
  public ignore(paths: string[]): Promise<boolean> {
    if (!Array.isArray(paths) && typeof paths === 'string') paths = [paths]
    return new Promise((resolve, reject) => {
      this.ipc.sendAndReceive('app:ignore', paths, (error, data: boolean) => {
        if (error) reject(error)
        else resolve(data)
      })
    })
  }
}
export default Watcher
