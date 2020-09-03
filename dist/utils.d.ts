export declare const binVersion = "v0.0.4";
export declare const binName: string;
export declare const binPath: string;
export declare const cachePath: string;
export declare function downloadBinary(from: string): Promise<unknown>;
export declare function mkdirFallback(targetDir: string, isRelativeToScript?: boolean): string;
