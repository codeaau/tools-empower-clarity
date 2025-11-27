type RunOptions = {
    logDir?: string;
    root?: string;
    verbose?: boolean;
    json?: boolean;
};
export declare function run(options?: RunOptions): Promise<{
    status: string;
    schemaKeys: string[];
}>;
export {};
