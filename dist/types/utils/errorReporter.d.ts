export type ErrorContext = {
    source?: string;
    func?: string;
    location?: string;
};
export declare function formatError(err: Error, context?: ErrorContext): {
    message: string;
    name: string;
    source: string;
    function: string;
    location: string;
    stack: string | undefined;
};
