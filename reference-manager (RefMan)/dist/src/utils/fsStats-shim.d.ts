export declare class StatsShim {
    dev: number;
    ino: number;
    mode: number;
    nlink: number;
    uid: number;
    gid: number;
    size: number;
    blksize: number;
    blocks: number;
    atimeMs: number;
    mtimeMs: number;
    ctimeMs: number;
    atime: Date;
    mtime: Date;
    ctime: Date;
    constructor(dev?: number, ino?: number, mode?: number, nlink?: number, uid?: number, gid?: number, size?: number, blksize?: number, blocks?: number, atimeMs?: number, mtimeMs?: number, ctimeMs?: number, atime?: Date, mtime?: Date, ctime?: Date);
    isFile(): boolean;
    isDirectory(): boolean;
}
export declare function fromFsStat(s: import('fs').Stats): StatsShim;
//# sourceMappingURL=fsStats-shim.d.ts.map