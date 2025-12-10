export declare function ensureDirSync(dirPath: string): void;
export declare function artifactPaths({ baseDir, kind, id, ext, }: {
    baseDir: string;
    kind: string;
    id: string;
    ext?: string;
}): {
    humanPath: string;
    jsonPath: string;
};
