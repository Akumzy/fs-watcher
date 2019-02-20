"use strict";
const utils_1 = require("./utils");
const fs_1 = require("fs");
const IPC = require("ipc-node-go");
function pathExists(path) {
    return new Promise(resolve => {
        fs_1.access(path, (err) => {
            if (err)
                resolve(false);
            else
                resolve(true);
        });
    });
}
class Watcher {
    constructor(option) {
        this.option = option;
        this.ipc = new IPC(utils_1.binPath);
    }
    /**
     * start
     */
    async start(cb) {
        if (!(await pathExists(utils_1.binPath))) {
            throw 'Binary file is messing. please make sure the package is installed successfully.';
        }
        const ipc = this.ipc;
        ipc.init();
        ipc.once('app:ready', () => {
            ipc.send('app:user-config', this.option);
        });
        ipc.on('app:change', (info) => {
            if (typeof cb === 'function')
                cb(info);
        });
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
    ignore(path) {
        return new Promise((resolve, reject) => {
            this.ipc.sendAndReceive('app:ignore', path, (error, data) => {
                if (error)
                    reject(error);
                else
                    resolve(data);
            });
        });
    }
}
module.exports = Watcher;
