export declare enum Op {
    Create = 0,
    Write = 1,
    Remove = 2,
    Rename = 3,
    Chmod = 4,
    Move = 5
}
interface WatcherOption {
    interval: number;
    ignoreHiddenFiles: boolean;
    ignorePaths: string[];
    filters: Op[];
    binPath?: string;
    path: string;
    recursive: true;
    debug: false;
}
interface EventInfo {
    event: Op;
    fileInfo: FileInfo;
}
interface FileInfo {
    size: number;
    modTime: Date;
    path: string;
    name: string;
    oldPath?: string;
    isDir: boolean;
    mode?: number;
}
declare class Watcher {
    private option;
    private ipc;
    constructor(option: WatcherOption);
    /**
     * start
     */
    start(cb: (err: any, info: EventInfo | FileInfo[]) => void): void;
    /**
     * This return all the watched files per cycle.
     */
    getWatchedFiles(): Promise<FileInfo[]>;
    /**
     * Listen to any change event you want to.
     * @param event the name of event you want to listen to.
     * @param cb the callback function that will handler the event.
     */
    onChange(event: 'create' | 'remove' | 'rename' | 'chmod' | 'move' | 'write', cb: (file: FileInfo) => void): this;
    /**
     * `Watcher.onAll` method listens for all change events
     * @param cb is callback function that will be called on new changes
     */
    onAll(cb: (event: string, file: FileInfo) => void): this;
    /**
     *  Once this event emits it's very likely that the `Watcher` process has been closed.
     * @param cb
     */
    onError(cb: (error: any) => void): this;
    /**
     * stop
     */
    stop(): void;
    /**
     * AddRecursive adds either a single file or directory recursively to the file list.
     * @param path path to watch
     */
    addRecursive(path: string): Promise<boolean>;
    /**
     * Add a single file or directory.
     * @param path path to watch
     */
    add(path: string): Promise<boolean>;
    /**
     * unwatch a single file or directory.
     * @param path path to unwatch
     */
    remove(path: string): Promise<boolean>;
    /**
     *  RemoveRecursive removes either a single file or a directory recursively from the file's list.
     * @param path path to unwatch
     */
    removeRecursive(path: string): Promise<boolean>;
    /**
     *  ignore  file or a directory.
     * @param path path to unwatch
     */
    ignore(paths: string[]): Promise<boolean>;
}
export default Watcher;
