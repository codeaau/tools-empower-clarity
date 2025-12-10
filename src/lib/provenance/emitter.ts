import crypto from 'node:crypto';
import fs from 'node:fs';

export function sha256OfFile(path: string) {
  const data = fs.readFileSync(path);
  return crypto.createHash('sha256').update(data).digest('hex');
}

export class ProvenanceRecord {
    clock: string;
    actor: string;
    task: string;
    source: string;
    inputs: string[];
    outputs: string[];
    notes?: string;
    metaPath: string;

    constructor(clock: string, actor: string, task: string, source: string, inputs: string[], outputs: string[], metaPath: string, notes?: string) {
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

export function emitProvenance({
  clock,
  actor,
  task,
  source,
  inputs,
  outputs,
  notes,
  metaPath
}: ProvenanceRecord) {
  const digest = outputs[0] ? sha256OfFile(outputs[0]) : '';
  const record = { clock, actor, task, source, inputs, outputs, digest, notes: notes ?? '' };
  fs.writeFileSync(metaPath, JSON.stringify(record, null, 2) + '\n', 'utf8');
  return record;
}
