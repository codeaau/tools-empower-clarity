type ArtifactOpts = {
    baseDir: string;
    namespace: string;
    kind: string;
    clock?: string;
    id?: string;
    ext?: 'json' | 'ndjson' | 'txt' | 'md';
};
export declare function ensureDir(p: string): void;
export declare function deterministicPaths(opts: ArtifactOpts): {
    dir: string;
    file: string;
    meta: string;
    clock: string;
};
export declare function writeJson(file: string, data: unknown): void;
export {};
