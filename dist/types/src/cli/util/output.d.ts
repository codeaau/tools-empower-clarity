type Report = {
    humanPath: string;
    machine: {
        path: string;
        type: 'json' | 'ndjson' | 'txt';
    };
    metaPath?: string;
};
export declare function printReport(r: Report): void;
export {};
