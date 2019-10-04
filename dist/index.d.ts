export declare enum Op {
    Create = 0,
    Write = 1,
    Remove = 2,
    Rename = 3,
    Chmod = 4,
    Move = 5
}
export declare const OpToString: {
    [key: number]: string;
};
export interface WatcherOption {
    /**The polling interval in milliseconds. default is 100ms */
    interval: number;
    /**to ignore hidden files */
    ignoreHiddenFiles: boolean;
    /**Array of paths to be ignored at startup */
    ignorePaths?: string[];
    /**changes to subscribe to. */
    filters?: Op[];
    /**For any reason you want to keep the binary a different location */
    binPath?: string;
    /**path to watch */
    path: string;
    /**If to watch the specified path recursively */
    recursive: boolean;
    /**If you're ok with logging from child_process */
    debug?: boolean;
    /**Only files that match the regular expression during file listings
       will be watched.*/
    filterHooks?: {
        reg: string;
        /**If to use the file full path or just the file name */
        useFullPath: boolean;
    }[];
}
export interface FileInfo {
    size: number;
    modTime: Date;
    path: string;
    name: string;
    oldPath?: string;
    isDir: boolean;
    mode?: number;
    /**Hash bash on the file absolute path */
    id: string;
    oldId?: string;
}
declare class Watcher {
    private option;
    private ipc;
    constructor(option: WatcherOption);
    /**
     * `start` states the watcher and return
     * all watched files and directory or error is any.
     *
     */
    start(cb?: (err: any, info: FileInfo[]) => void): Promise<FileInfo[]>;
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
    onAll(cb: (event: 'create' | 'remove' | 'rename' | 'chmod' | 'move' | 'write', file: FileInfo) => void): this;
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
