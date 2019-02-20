interface WatcherOption {
    duration: number;
    ignoreHiddenFiles: boolean;
    ignorePaths: string[];
    filters: ['create', 'remove', 'move', 'write', 'chmod', 'rename'];
}
interface EventInfo {
    event: 'create' | 'remove' | 'move' | 'write' | 'chmod' | 'rename';
    fileInfo: {
        size: number;
        modTime: Date;
        path: string;
        name: string;
        oldPath?: string;
        isDir: boolean;
    };
}
declare class Watcher {
    private option;
    private ipc;
    constructor(option: WatcherOption);
    /**
     * start
     */
    start(cb: (info: EventInfo) => void): Promise<void>;
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
    ignore(path: string): Promise<boolean>;
}
export = Watcher;
