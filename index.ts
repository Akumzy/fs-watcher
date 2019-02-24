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
interface WatcherOption {
  interval: number // The polling interval in milliseconds. default is 100ms
  ignoreHiddenFiles: boolean // to ignore hidden files
  ignorePaths: string[] // Array of paths to be igored at startup
  filters: Op[] // changes to subscrib to.
  binPath?: string // For any reason you want to keep the binary a different location
  path: string // path to watch
  recursive: true // if to watch the specified path recursively
  debug: false // If you're ok with logging from child_process
}
interface EventInfo {
  event: Op
  fileInfo: FileInfo
}
interface FileInfo {
  size: number
  modTime: Date
  path: string
  name: string
  oldPath?: string
  isDir: boolean
  mode?: number
}

class Watcher {
  private ipc = new IPC(binPath || this.option.binPath)
  constructor(private option: WatcherOption) {
    if (this.option.debug) {
      this.ipc.on('log', console.log)
    }
  }
  /**
   * start
   */
  public start(cb: (err: any, info: EventInfo | FileInfo[]) => void) {
    if (!binPath && !this.option.binPath) {
      cb('Binary file is messing. please make sure the package is installed successfully.', null)
    }
    const ipc = this.ipc
    ipc.init()
    if (!this.option.interval) this.option.interval = 100
    ipc.once('app:ready', () => {
      ipc.sendAndReceive('app:start', this.option, (err, data: FileInfo[]) => {
        cb(err, data)
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
