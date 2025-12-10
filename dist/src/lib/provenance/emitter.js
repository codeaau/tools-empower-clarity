import crypto from 'node:crypto';
import fs from 'node:fs';
export function sha256OfFile(path) {
    const data = fs.readFileSync(path);
    return crypto.createHash('sha256').update(data).digest('hex');
}
export class ProvenanceRecord {
    constructor(clock, actor, task, source, inputs, outputs, metaPath, notes) {
        this.clock = clock;
        this.actor = actor;
        this.task = task;
        this.source = source;
        this.inputs = inputs;
        this.outputs = outputs;
        this.metaPath = metaPath;
        this.notes = notes;
    }
}
export function emitProvenance({ clock, actor, task, source, inputs, outputs, notes, metaPath }) {
    const digest = outputs[0] ? sha256OfFile(outputs[0]) : '';
    const record = { clock, actor, task, source, inputs, outputs, digest, notes: notes ?? '' };
    fs.writeFileSync(metaPath, JSON.stringify(record, null, 2) + '\n', 'utf8');
    return record;
}
