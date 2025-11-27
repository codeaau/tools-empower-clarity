// Clarity's local-only Barrel File
/*

---------------------------------------------------
All code is provided below each export. Enjoy.
---------------------------------------------------

CLARITY\SRC\[CORE, TESTS]\[
    core: [persistance, ids, validateSession, config, buildSession, makeId],
    tests: [assert, testRunner],
]: 


*/
export const core = {
    persistence: require('./core/persistence'),
    /*
    export async function saveSession(session: Record<string, unknown>): Promise<string> {
      const dir = CONFIG.DATA_PATH;
      await fs.mkdir(dir, { recursive: true });
      const id = (session as any).id ?? generateId('session');
      const file = path.join(dir, `${id}.json`);
      await fs.writeFile(file, JSON.stringify(session, null, 2), 'utf-8');
      return id;
    }
    
    export async function loadSession(id: string): Promise<Record<string, unknown> | null> {
      const file = path.join(CONFIG.DATA_PATH, `${id}.json`);
      try {
        const raw = await fs.readFile(file, 'utf-8');
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    */
    ids: require('./core/ids'),
    /*
    export function generateId(prefix: string = "CLARITY"): string {
      const timestamp = Date.now().toString(36);
      const unique = randomUUID().split("-")[0]; // short segment
      return `${prefix}-${timestamp}-${unique}`;
    }

    */
    validateSession: require('./core/validateSession'),
    /*
    export interface ValidationResult {
        valid: boolean;
        errors?: string[];
        integrity_hash?: string;
    }
    
    type AjvError = ErrorObject<string, Record<string, unknown>>;

    function computeIntegrityHash(session: Session): string {
        const canonical = {
            intention: session.intention, 
            factual: session.factual, 
            resulting: session.resulting, 
            meta: session.meta,
        };
        const json = JSON.stringify(canonical);
        return createHash("sha256").update(json).digest("hex");
    }

    export function validateSession(session: Session): ValidationResult {
        const valid = validate(session);
        
        if (!valid) {
            const errors: string[] | undefined = validate.errors?.map((e: AjvError) => `schema${e.instancePath} ${e.message}`);
            return { valid: false, errors };
        }
    
        if (session.factual.ended_at && session.factual.started_at) {
            const start = new Date(session.factual.started_at).getTime();
            const end = new Date(session.factual.ended_at).getTime();
            if (end < start) {
                return {
                    valid: false,
                    errors: ["semantic: factual.ended_at must be >= factual.started_at"],
                };
            }
        }
    
        // Append-only edits check 
        // (basic enforcement: no overwrite detection here,
        // but ensures edits[] is an array of objects with required fields)
        for (const [i, edit] of session.edits.entries()) {
            if (!edit.who || !edit.when || !edit.why || !edit.intention || !edit.what) {
                return {
                    valid: false,
                    errors: [`edits[${i}] is missing required fields`],
                };
            }
        }
        
        // Compute integrity hash
        const integrity_hash = computeIntegrityHash(session);
        return { valid: true, integrity_hash };
    }

    */
    config: require('./core/config'),
    /*
    export const CONFIG = {
        APP_NAME: "CLARITY",
        VERSION: "0.1.0",
        LOG_PATH: "./data/logs/",
        DATA_PATH: "./data/store/",
        IMMUTABLE: true, // enforce append-only writes
    };

    */
    buildSession: require('./core/buildSession'),
    /*
    export interface Intention {
        description: string;
        duration_minutes?: number;
    }

    export interface Factual {
        started_at: string;     
        ended_at?: string;      
    }

    export interface Resulting {
        outcome?: string;       
        notes?: string;
    }

    export interface Meta {
        session_id: string;
        created_at: string;
        created_by: string;       
    }

    export interface Edit {
        who: string;
        when: string;
        why: string;
        intention: string;
        what: Record<string, unknown>;
    }

    export interface Session {
        intention: Intention;
        factual: Factual;
        resulting: Resulting;
        meta: Meta;
        edits: Edit[];
    }


    export function buildSession(
        prefix: string,
        alias: string,
        intention: Intention,
        factual: Factual,
        resulting: Resulting = {}): Session {
            const sessionId = makeId(prefix);
            const now = new Date().toISOString();
            return  {
                intention,
                factual,
                resulting,
                meta:  {
                    session_id: sessionId,
                    created_at: now,
                    created_by: alias,
                },
                edits: [],
            };
    }
        
    */
    makeId: require('./core/makeId'),
    /*
    export function makeId(prefix: string = 'U', date: Date = new Date()): string {
    if (!/^[A-Z]$/.test(prefix)) {
        throw new Error("prefix must be a single uppercase letter");
    }
    const ts = utcTimestampForId(date);
    const uuid = randomUUID();
    return `${prefix}-${ts}-${uuid}`;
    }

    function pad(n: number): string {
    return n.toString().padStart(2, "0");
    }

    function utcTimestampForId(date: Date): string {
    const y = date.getUTCFullYear();
    const m = pad(date.getUTCMonth() + 1);
    const d = pad(date.getUTCDate());
    const hh = pad(date.getUTCHours());
    const mm = pad(date.getUTCMinutes());
    const ss = pad(date.getUTCSeconds());
    return `${y}${m}${d}T${hh}${mm}${ss}Z`;
    }

    */
};

export const tests = {

    // persistenceTest: require('./tests/persistence.test'),                                                             // zero exports            

    assert: require('./tests/assert'),
    /*
    export function expect<T>(received: T) {
        return {
            toBe(expected: T) {
            if (received !== expected) {
                throw new Error(`Expected ${received} to be ${expected}`);
            }
            },
            not: {
            toBe(expected: T) {
                if (received === expected) {
                throw new Error(`Expected ${received} not to be ${expected}`);
                }
            }
            },
            toBeTruthy() {
            if (!received) {
                throw new Error(`Expected ${received} to be truthy`);
            }
            },
            toBeFalsy() {
            if (received) {
                throw new Error(`Expected ${received} to be falsy`);
            }
            },
            toEqual(expected: any) {
            const r = JSON.stringify(received);
            const e = JSON.stringify(expected);
            if (r !== e) {
                throw new Error(`Expected ${r} to equal ${e}`);
            }
            }
        };
    }

    */

    // index: require('./tests/index'),                                                                             zero exports

    testRunner: require('./tests/testRunner'),          
    /*
    type TestFn = () => void | Promise<void>;

    interface TestCase {
    name: string;
    fn: TestFn;
    }

    const tests: TestCase[] = [];

    export function test(name: string, fn: TestFn) {
        tests.push({ name, fn });
    }

    export async function run() {
        let passed = 0;
        for (const { name, fn } of tests) {
            try {
            await fn();
            console.log(`✅ ${name}`);
            passed++;
            } catch (err) {
            console.error(`❌ ${name}`);
            console.error(err instanceof Error ? err.message : err);
            }
        }
        console.log(`\n${passed}/${tests.length} tests passed`);
    }

    export function assert(condition: unknown, message = "Assertion failed") {
    if (!condition) throw new Error(message);
    }

    export function assertEqual<T>(a: T, b: T, message?: string) {
    if (a !== b) throw new Error(message ?? `Expected ${a} === ${b}`);
    }

    export async function assertThrows(fn: TestFn, message?: string) {
    let threw = false;
    try {
        await fn();
    } catch {
        threw = true;
    }
    if (!threw) throw new Error(message ?? "Expected function to throw");
    }

    */
};

export const patches = {

    patchUtils: require('./patches/patch-utils'),       
    /*
    interface PatchOptions {
        patchName: string;
        added?: string;
        updated?: string;
        notes?: string;
        author?: string;
        status?: string;
    }

    export async function createPatch(opts: PatchOptions): Promise<void> {
      const ts = generateTimestamp();
      const patchRoot = ensurePatchFolder(opts.patchName);
    
      writeTxtLedger(patchRoot, opts, ts);
      writeMdNarrative(patchRoot, opts, ts);
      writeJsonMetadata(patchRoot, opts, ts);
    }
    */
};