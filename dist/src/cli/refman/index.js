// ./src/cli/refman/index.ts
import { Command } from 'commander';
import { addCommonFlags } from '../flags.js';
import { deterministicPaths, writeJson } from '../../lib/artifacts/deterministic.js';
import { printReport } from '../util/output.js';
import { emitProvenance } from '../../lib/provenance/emitter.js';
export function refmanIndex() {
    const cmd = new Command('index')
        .description('Build RefMan index')
        .action(async (opts) => {
        const items = await loadRefmanItems(); // your existing loader
        const total = items.length;
        // Dry-run: print estimate, no writes
        if (opts.dryRun) {
            const summary = { task: 'refman.index', total, estimateBytes: estimateBytes(items) };
            console.log('Dry-run summary:');
            console.log(JSON.stringify(summary, null, 2));
            if (opts.json)
                console.log(JSON.stringify(summary));
            return;
        }
        // Safe truncation
        const limit = parseInt(String(opts.truncate || ''), 10);
        const truncated = Number.isFinite(limit) && limit > 0 && limit < total;
        const outItems = truncated ? items.slice(0, limit) : items;
        const { file, meta, clock } = deterministicPaths({
            baseDir: opts.outdir,
            namespace: 'refman',
            kind: 'index',
            clock: opts.clock,
            id: truncated ? `top-${limit}-of-${total}` : `all-${total}`,
            ext: 'json'
        });
        // Omission note
        const omission = truncated
            ? { omitted: total - limit, note: 'results truncated for demo/size safety' }
            : null;
        writeJson(file, { clock, total, items: outItems, omission });
        writeJson(meta, {
            task: 'refman.index',
            source: 'refman',
            createdAt: clock,
            paths: { file, meta },
            counts: { total, written: outItems.length, omitted: omission?.omitted ?? 0 }
        });
        printReport({
            humanPath: file,
            machine: { path: file, type: 'json' },
            metaPath: meta
        });
        emitProvenance({
            clock,
            actor: 'cli@clarity',
            task: 'refman.index',
            source: 'refman',
            inputs: [], // fill with actual input paths
            outputs: [file, meta],
            notes: truncated ? 'truncated output (demo safety)' : '',
            metaPath: meta
        });
    });
    return addCommonFlags(cmd);
}
// helpers (stubs)
async function loadRefmanItems() { return []; }
function estimateBytes(items) { return JSON.stringify(items).length; }
