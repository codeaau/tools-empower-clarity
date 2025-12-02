# Usage Examples

1. Full Repo Snapshot
    Dump the entire repository into a text file:

        terminal:   bash
        code:       node export-repo-readable.js --out repo_snapshot.txt --contents
        output:     repo_snapshot.txt

    Includes all directories and files (except excluded ones like node_modules, .git, dist, build).

    Full contents are included unless files exceed --max-bytes.

2. Scoped Directory Snapshot
    Dump only a specific directory (e.g., trueData):

        terminal:   bash
        code:       node export-repo-readable.js --dir trueData --out trueData_snapshot.txt --contents
        output:     trueData_snapshot.txt

    Includes only files under trueData.

    Useful for sharing subsystem-specific data without oversized files.

3. Snapshot with Size Limit
    Dump src directory, but preview large files instead of full contents:

        terminal:   bash
        code:       node export-repo-readable.js --dir src --out src_snapshot.txt --contents --max-bytes 200000
        output:     src_snapshot.txt

    Files larger than 200 KB will show head + tail previews with skipped byte count.

4. Excluding Directories
    Exclude additional directories beyond defaults:

        terminal:   bash
        code:       node export-repo-readable.js --out repo_snapshot.txt --contents --exclude node_modules,.git,dist,logs


# Parameters

    Flag	                Description	                                                Default
    --------------------------------------------------------------------------------------------------
    --out	                Output file name	                                        repo_snapshot.txt
    --contents	            Include file contents	                                    false
    --max-bytes N	        Max size for full content dump; larger files get previews	500000 (500 KB)
    --preview-chunk N	    Size of head/tail chunks for previews	                    65536 (64 KB)
    --exclude	            Comma-separated directories to exclude                      node_modules,.git,dist,build
    --show-hidden	        Include hidden files (dotfiles)	                            false
    --dir	                Scope snapshot to a specific directory	                    ROOT (entire repo)


# Example Workflow
    Generate a full repo snapshot for archival:

        bash
        node export-repo-readable.js --out repo_snapshot.txt --contents
        If the file is too large, generate scoped snapshots:

        bash
        node export-repo-readable.js --dir trueData --out trueData_snapshot.txt --contents
        node export-repo-readable.js --dir src --out src_snapshot.txt --contents
        Share the scoped snapshots with Copilot for analysis.