export interface ProvenanceRecord {
    id: string;
    eventId?: string;
    method: "entered" | "inferred" | "system-default";
    source: "coordinates" | "tzName" | "system" | string;
    rawResolverOutput?: any;
    userConfirmed?: boolean;
    note?: string;
    timestamp: string;
}
export declare function appendProvenance(record: ProvenanceRecord): Promise<void>;
type RunOptions = {
    logDir?: string;
    root?: string;
    verbose?: boolean;
    json?: boolean;
};
export declare function run(options?: RunOptions): Promise<{
    status: string;
    recordsCount: number;
    sources: string[];
    auditFile: string;
    summary: string;
}>;
export {};
