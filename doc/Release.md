# Release

## What a release contains

Every tag produces a draft release with:

| asset | purpose |
| --- | --- |
| `jaes-dead-drop-<version>.tar.gz` | source archive |
| `jaes-dead-drop-<version>.zip` | same tree, zip |
| `sha256sums.txt` | SHA-256 of both archives |
| `multiple.intoto.jsonl` | SLSA provenance for the assets above |

The archives are built by `bin/make-release` from the tag with `git archive`
and `gzip -9n`: entries carry the commit's mtimes and the gzip header holds no
timestamp, so the same tag always produces the same bytes on any machine.
GitHub's own "Source code (…)" links are *not* used, because those archives are
regenerated server-side and their hashes have changed before.

The SLSA provenance is produced by
[`.github/workflows/release.yml`](../.github/workflows/release.yml) on GitHub's
own runners and covers the exact assets uploaded, so neither a rogue maintainer
nor a modified workflow can swap them afterwards.

## Verify a download

```bash
sha256sum --check --ignore-missing sha256sums.txt
slsa-verifier verify-artifact --provenance jaes-dead-drop-<version>.intoto.jsonl \
  --source-uri github.com/JaeSwiftxyz/jaes-dead-drop jaes-dead-drop-<version>.tar.gz
```

The second command checks the provenance against the repository and the workflow
that built the asset, which is what makes the checksum unforgeable. Use the
[SLSA verifier](https://github.com/slsa-framework/slsa-verifier#verification-for-github-builders)
(`gh attestation verify` does not read this bundle, it only sees attestations
created with `actions/attest`).

Tags may additionally be signed; `git tag --verify <tag>` tells you.

## Checklist

1. Bump the version in `lib/Controller.php`, `Makefile`, `js/package.json`,
   `README.md`, `SECURITY.md` and add a `CHANGELOG.md` entry.
2. `php bin/update-sri`, run both test suites.
3. `git tag -s <version>` (annotated, signed) and push the tag.
4. Wait for the workflow. It builds the archives, uploads them with
   `sha256sums.txt`, then attaches provenance from the SLSA generator.
5. Check `sha256sums.txt` in the draft against a local `bin/make-release`
   run — they must match.
6. Publish the draft.

If CI is unavailable, steps 4 can be done by hand: `bin/make-release <version>`,
upload `dist/*` to the release, and skip the provenance (say so in the notes).
