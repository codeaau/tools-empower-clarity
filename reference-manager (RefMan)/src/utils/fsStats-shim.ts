// src/utils/stats-shim.ts
export class StatsShim {
  constructor(
    public dev = 0,
    public ino = 0,
    public mode = 0,
    public nlink = 0,
    public uid = 0,
    public gid = 0,
    public size = 0,
    public blksize = 0,
    public blocks = 0,
    public atimeMs = 0,
    public mtimeMs = 0,
    public ctimeMs = 0,
    public atime = new Date(0),
    public mtime = new Date(0),
    public ctime = new Date(0)
  ) {}
  isFile(): boolean { return (this.mode & 0o170000) === 0o100000; }
  isDirectory(): boolean { return (this.mode & 0o170000) === 0o040000; }
}
export function fromFsStat(s: import('fs').Stats): StatsShim {
  return new StatsShim(
    (s as any).dev ?? 0,
    (s as any).ino ?? 0,
    (s as any).mode ?? 0,
    (s as any).nlink ?? 0,
    (s as any).uid ?? 0,
    (s as any).gid ?? 0,
    s.size ?? 0,
    (s as any).blksize ?? 0,
    (s as any).blocks ?? 0,
    s.atimeMs ?? 0,
    s.mtimeMs ?? 0,
    s.ctimeMs ?? 0,
    s.atime ?? new Date(0),
    s.mtime ?? new Date(0),
    s.ctime ?? new Date(0)
  );
}
