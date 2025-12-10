// ./src/cli/util/output.ts
type Report = {
  humanPath: string;
  machine: { path: string; type: 'json' | 'ndjson' | 'txt' };
  metaPath?: string;
};

export function printReport(r: Report) {
  // Human line: stable, copy/pasteable
  console.log(`Wrote artifact: ${r.humanPath}`);
  // Machine line: single JSON object for tooling
  console.log(
    JSON.stringify(
      { artifact: r.machine.path, type: r.machine.type, meta: r.metaPath ?? null },
      null,
      0
    )
  );
}
