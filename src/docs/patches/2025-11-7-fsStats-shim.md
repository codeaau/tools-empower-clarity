# TL;DR ---------------------------------------------------------------------------
chore(patches): add fsStats-shim patch record

- Introduced './reference-manager/src/core/utils/fsStats-shim.ts' to replace deprecated fs' `new Stats()` usage.
- Updated node-internal-modules-esm-resolve.js to require shim instead of fs.Stats.
- Added documentation artifacts under src/docs/patches/:
  - 2025-11-07-fsStats-shim.txt (plain summary)
  - 2025-11-07-fsStats-shim.md (detailed rationale + diff)
  - 2025-11-07-fsStats-shim.json (metadata record)
- Verified build and tests pass; DEP0180 warnings eliminated.
# ---------------------------------------------------------------------------------

## Patch Documentation: fsStats-shim Integration

### Context
Node.js deprecated direct construction of `fs.Stats` objects (DEP0180).  
The `ts-node` package includes a copy of Node’s internal ESM resolver (`node-internal-modules-esm-resolve.js`) which still used `new Stats()`.  
This triggered deprecation warnings during development.

### Action Taken
To eliminate the warning and maintain compatibility, we introduced a custom shim class (`fsStats-shim.ts`) that replicates the public surface of `fs.Stats` objects without relying on the deprecated constructor.

#### New File
- **Path:** `src/utils/fsStats-shim.ts`
- **Purpose:** Provide a safe replacement for `fs.Stats` with key fields and methods (`isFile()`, `isDirectory()`, timestamps, size, mode, etc.).
- **Compiled Output:** `dist/utils/fsStats-shim.js`

#### File Updated
- **Path:** `node_modules/ts-node/dist-raw/node-internal-modules-esm-resolve.js`
- **Changes:**
  - Removed `Stats` from the `fs` import.
  - Added `require('../../../../dist/utils/fsStats-shim.js')` to import the shim.
  - Replaced `const statsIfNotFound = new Stats();` with `const statsIfNotFound = new StatsShim();`.

#### Example Diff
```diff
- const { realpathSync, statSync, Stats } = require('fs');
+ const { realpathSync, statSync } = require('fs');
+ const { StatsShim } = require('../../../../dist/utils/fsStats-shim.js');

- const statsIfNotFound = new Stats();
+ const statsIfNotFound = new StatsShim();
