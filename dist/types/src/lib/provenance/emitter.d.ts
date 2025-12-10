export declare function sha256OfFile(path: string): string;
export declare class ProvenanceRecord {
    clock: string;
    actor: string;
    task: string;
    source: string;
    inputs: string[];
    outputs: string[];
    notes?: string;
    metaPath: string;
    constructor(clock: string, actor: string, task: string, source: string, inputs: string[], outputs: string[], metaPath: string, notes?: string);
}
export declare function emitProvenance({ clock, actor, task, source, inputs, outputs, notes, metaPath }: ProvenanceRecord): {
    clock: string;
    actor: string;
    task: string;
    source: string;
    inputs: string[];
    outputs: string[];
    digest: string;
    notes: string;
};
