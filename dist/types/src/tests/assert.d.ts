export declare function expect<T>(received: T): {
    toBe(expected: T): void;
    not: {
        toBe(expected: T): void;
    };
    toBeTruthy(): void;
    toBeFalsy(): void;
    toEqual(expected: any): void;
};
