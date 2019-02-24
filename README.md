# fs-watcher

`fs-watcher` is based on this awesome `Go` package [github.com/radovskyb/watcher](https://github.com/radovskyb/watcher) for watching for files or directory changes (recursively or non recursively) without using filesystem events, which allows it to work cross platform consistently.
`@akumzy/fs-watcher` is made possible with the help of an IPC packages for Node and Go [ipc-node-go](https://github.com/Akumzy/ipc-node) and [fs-watcher-go](https://github.com/Akumzy/fs-watcher-go/)

<!-- ## Why using `Go` package? -->
<!-- I started a project that has to do with monitoring and syncing user files, which I was developing with [Electron](https://github.com/electron/electron) to develop and since official Node fs.watch module was not that reliable I decided to use [chokidar](https://github.com/paulmillr/chokidar) it was very help at start but as time goes on started having some little challenges eg. no rename event that means you have to keep track of add/addDir and unlink/unlinkDir to determine if  -->

# Installation

```bash
    npm install @akumzy/fs-watcher
    //or
    yarn add @akumzy/fs-watcher

```

# Features

- Customizable polling interval.
- Filter Events.
- Watch folders recursively or non-recursively.
- Choose to ignore hidden files.
- Choose to ignore specified files and folders.
- Notifies with some basic informations about the file that the event is based on. e.g
  - `name`
  - `modTime`
  - `path`
  - `oldPath` if the event is rename or move
  - `isDir`
  - `mode`
- Notifies the full path of the file that the event is based on or the old and new paths if the event was a `rename` or `move` event.
- List the files being watched.

# Example

```js
// using require method
const { default: Watcher, Op } = require('@akumzy/fs-watcher')
// or with es modules
import Watcher, { Op } from '@akumzy/fs-watcher'

const w = new Watcher({
  path: '/home/akumzy/Documents', // path you'll like to watch
  debug: true,
  filters: [Op.Create, Op.Write, Op.Rename], // changes to watch default is all
  recursive: true // to watch the specified path recursively
})
// start watching
w.start((err, files) => {
  if (!err) {
    console.log(err)
    return
  }
  console.log('f', files)
  ;(async () => {
    try {
      let res = await w.ignore('/home/akumzy/Music/Culture')
      console.log('Ignore was ', res ? 'successful' : 'total bs')
      await w.addRecursive('/home/akumzy/Music')
    } catch (error) {
      console.log(error)
    }
  })()
})
w.onChange('create', file => {
  console.log(file)
})
w.onChange('write', file => {
  console.log(file)
})
w.onChange('rename', file => {
  console.log(file)
})
w.onAll(event, file => {
  console.log(event, file)
})
w.onError(console.log)
```

# API

`Watcher(option: WatcherOption)`

## WatcherOption

- `interval: number;` The polling interval in milliseconds. default is 100ms
- `ignoreHiddenFiles: boolean;` to ignore hidden files
- `ignorePaths: string[];` Array of paths to be igored at startup
- `filters: Op[];` changes to subscrib to.
- `binPath?: string;` For any reason you want to keep the binary a different location
- `path: string;` path to watch
- `recursive: true;` if to watch the specified path recursively
- `debug: false;`If you're ok with logging from child_process

## methods

- `start(cb: (err: any, info: EventInfo | FileInfo[]) => void): void;` start the watcher
- `getWatchedFiles(): Promise<FileInfo[]>;` This return all the watched files per cycle.

- `onChange(event: 'create' | 'remove' | 'rename' | 'chmod' | 'move' | 'write', cb: (file: FileInfo) => void): this;` Listen to any change event you want to.

- `onAll(cb: (event: string, file: FileInfo) => void): this;` Listens for all change events

- `onError(cb: (error: any) => void): this;` Once this event emits it's very likely that the `Watcher` process has been closed. so is now left for to check and restart

- `stop(): void;` stop the `Watcher`

- `addRecursive(path: string): Promise<boolean>;` adds either a single file or directory recursively to the file list.

- `add(path: string): Promise<boolean>;` Add path to watch

- `remove(path: string): Promise<boolean>;` unwatch path

- `removeRecursive(path: string): Promise<boolean>;` unwatch path recursively

- `ignore(paths: string[]): Promise<boolean>;` Ignore path

## FileInfo

- `size: number;` File size in bytes.
- `modTime: Date;` File Last modification.
- `path: string;` File absolute path
- `name: string;` File name with extention if it's not a directory
- `oldPath?: string;` empty string if event is not `rename` or `move`
- `isDir: boolean;` File type which will be true it's a directory
- `mode?: number;` File mode

## Events

    Op {
        Create,
        Write,
        Remove,
        Rename,
        Chmod,
        Move
    }

All credits goes to [radovskyb](https://github.com/radovskyb) for creatng this [github.com/radovskyb/watcher](https://github.com/radovskyb/watcher) awesome Go package.
