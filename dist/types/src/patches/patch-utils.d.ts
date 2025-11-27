interface PatchOptions {
    patchName: string;
    added?: string;
    updated?: string;
    notes?: string;
    author?: string;
    status?: string;
}
export declare function createPatch(opts: PatchOptions): Promise<void>;
export {};
