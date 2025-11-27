type TestFn = () => void | Promise<void>;
export declare function test(name: string, fn: TestFn): void;
export declare function run(): Promise<void>;
export declare function assert(condition: unknown, message?: string): void;
export declare function assertEqual<T>(a: T, b: T, message?: string): void;
export declare function assertThrows(fn: TestFn, message?: string): Promise<void>;
export {};
