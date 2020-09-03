"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpToString = exports.Op = void 0;
const utils_1 = require("./utils");
const IPC = require("ipc-node-go");
var Op;
(function (Op) {
    Op[Op["Create"] = 0] = "Create";
    Op[Op["Write"] = 1] = "Write";
    Op[Op["Remove"] = 2] = "Remove";
    Op[Op["Rename"] = 3] = "Rename";
    Op[Op["Chmod"] = 4] = "Chmod";
    Op[Op["Move"] = 5] = "Move";
})(Op = exports.Op || (exports.Op = {}));
exports.OpToString = {
    [Op.Create]: 'create',
    [Op.Write]: 'write',
    [Op.Remove]: 'remove',
    [Op.Rename]: 'rename',
    [Op.Chmod]: 'chmod',
    [Op.Move]: 'move'
};
class Watcher {
    constructor(option) {
        this.option = option;
        this.ipc = new IPC(option.binPath || utils_1.binPath);
        if (this.option.debug) {
            this.ipc.on('log', console.log);
        }
    }
    /**
     * `start` states the watcher and return
     * all watched files and directory or error is any.
     *
     */
    start(cb) {
        return new Promise((resolve, reject) => {
            var _a, _b;
            if (!utils_1.binPath && !this.option.binPath) {
                let errMsg = 'Binary file is messing. please make sure the package is installed successfully';
                if (typeof cb === 'function')
                    cb(errMsg, null);
                else
                    reject(errMsg);
            }
            this.ipc.init();
            if (!this.option.interval)
                this.option.interval = 100;
            if (!((_b = (_a = this.option) === null || _a === void 0 ? void 0 : _a.filters) === null || _b === void 0 ? void 0 : _b.length)) {
                this.option.filters = [Op.Chmod, Op.Create, Op.Move, Op.Remove, Op.Rename, Op.Write];
            }
            if (!Array.isArray(this.option.path)) {
                this.option.path = [this.option.path];
            }
            this.ipc.once('app:ready', () => {
                this.ipc.sendAndReceive('app:start', this.option, (err, data) => {
                    if (typeof cb === 'function')
                        cb(err, data);
                    else {
                        if (err)
                            reject(err);
                        else
                            resolve(data);
                    }
                });
            });
        });
    }
    /**
     * This return all the watched files per cycle.
     */
    getWatchedFiles() {
        return new Promise((resolve, reject) => {
            this.ipc.sendAndReceive('app:getWatchedFiles', null, (error, data) => {
                if (error)
                    reject(error);
                else
                    resolve(data);
            });
        });
    }
    /**
     * Listen to any change event you want to.
     * @param event the name of event you want to listen to.
     * @param cb the callback function that will handler the event.
     */
    onChange(event, cb) {
        this.ipc.on('app:change', (info) => {
            if (event === exports.OpToString[info.event]) {
                cb(info.fileInfo);
            }
        });
        return this;
    }
    /**
     * `Watcher.onAll` method listens for all change events
     * @param cb is callback function that will be called on new changes
     */
    onAll(cb) {
        this.ipc.on('app:change', (info) => {
            cb(exports.OpToString[info.event], info.fileInfo);
        });
        return this;
    }
    /**
     *  Once this event emits it's very likely that the `Watcher` process has been closed.
     * @param cb
     */
    onError(cb) {
        this.ipc.on('app:error', cb);
        this.ipc.on('error', cb);
        return this;
    }
    /**
     * stop
     */
    stop() {
        this.ipc.kill();
    }
    /**
     * AddRecursive adds either a single file or directory recursively to the file list.
     * @param path path to watch
     */
    addRecursive(path) {
        return new Promise((resolve, reject) => {
            this.ipc.sendAndReceive('app:addRecursive', path, (error, data) => {
                if (error)
                    reject(error);
                else
                    resolve(data);
            });
        });
    }
    /**
     * Add a single file or directory.
     * @param path path to watch
     */
    add(path) {
        return new Promise((resolve, reject) => {
            this.ipc.sendAndReceive('app:add', path, (error, data) => {
                if (error)
                    reject(error);
                else
                    resolve(data);
            });
        });
    }
    /**
     * unwatch a single file or directory.
     * @param path path to unwatch
     */
    remove(path) {
        return new Promise((resolve, reject) => {
            this.ipc.sendAndReceive('app:remove', path, (error, data) => {
                if (error)
                    reject(error);
                else
                    resolve(data);
            });
        });
    }
    /**
     *  RemoveRecursive removes either a single file or a directory recursively from the file's list.
     * @param path path to unwatch
     */
    removeRecursive(path) {
        return new Promise((resolve, reject) => {
            this.ipc.sendAndReceive('app:removeRecursive', path, (error, data) => {
                if (error)
                    reject(error);
                else
                    resolve(data);
            });
        });
    }
    /**
     *  ignore  file or a directory.
     * @param path path to unwatch
     */
    ignore(paths) {
        if (!Array.isArray(paths) && typeof paths === 'string')
            paths = [paths];
        return new Promise((resolve, reject) => {
            this.ipc.sendAndReceive('app:ignore', paths, (error, data) => {
                if (error)
                    reject(error);
                else
                    resolve(data);
            });
        });
    }
}
exports.default = Watcher;
