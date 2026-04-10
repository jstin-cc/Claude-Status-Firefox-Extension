#!/usr/bin/env python3
r"""
Create an AMO-compliant zip for the Firefox extension.

PowerShell's Compress-Archive uses backslashes as path separators on
Windows, which makes AMO reject the upload with:
    Invalid file name in archive: icons\icon-128.png

zipfile writes forward slashes for `arcname`, which AMO accepts.

Usage:
    python scripts/make-zip.py <source-dir> <zip-path>
"""
import os
import sys
import zipfile


def main():
    if len(sys.argv) != 3:
        print("usage: make-zip.py <source-dir> <zip-path>", file=sys.stderr)
        sys.exit(2)

    src = os.path.abspath(sys.argv[1])
    dst = os.path.abspath(sys.argv[2])

    if not os.path.isdir(src):
        print(f"source is not a directory: {src}", file=sys.stderr)
        sys.exit(1)

    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if os.path.exists(dst):
        os.remove(dst)

    with zipfile.ZipFile(dst, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for root, _dirs, files in os.walk(src):
            for f in files:
                full = os.path.join(root, f)
                rel = os.path.relpath(full, src).replace(os.sep, "/")
                zf.write(full, arcname=rel)

    print(f"wrote {dst}")


if __name__ == "__main__":
    main()
