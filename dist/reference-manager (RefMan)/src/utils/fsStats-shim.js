// src/utils/stats-shim.ts
export class StatsShim {
    constructor(dev = 0, ino = 0, mode = 0, nlink = 0, uid = 0, gid = 0, size = 0, blksize = 0, blocks = 0, atimeMs = 0, mtimeMs = 0, ctimeMs = 0, atime = new Date(0), mtime = new Date(0), ctime = new Date(0)) {
        this.dev = dev;
        this.ino = ino;
        this.mode = mode;
        this.nlink = nlink;
        this.uid = uid;
        this.gid = gid;
        this.size = size;
        this.blksize = blksize;
        this.blocks = blocks;
        this.atimeMs = atimeMs;
        this.mtimeMs = mtimeMs;
        this.ctimeMs = ctimeMs;
        this.atime = atime;
        this.mtime = mtime;
        this.ctime = ctime;
    }
    isFile() { return (this.mode & 0o170000) === 0o100000; }
    isDirectory() { return (this.mode & 0o170000) === 0o040000; }
}
export function fromFsStat(s) {
    return new StatsShim(s.dev ?? 0, s.ino ?? 0, s.mode ?? 0, s.nlink ?? 0, s.uid ?? 0, s.gid ?? 0, s.size ?? 0, s.blksize ?? 0, s.blocks ?? 0, s.atimeMs ?? 0, s.mtimeMs ?? 0, s.ctimeMs ?? 0, s.atime ?? new Date(0), s.mtime ?? new Date(0), s.ctime ?? new Date(0));
}
