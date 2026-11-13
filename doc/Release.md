# Release

## What a release contains

Every tag produces a draft release with:

| asset | purpose |
| --- | --- |
| `jaes-dead-drop-<version>.tar.gz` | source archive |
| `jaes-dead-drop-<version>.zip` | same tree, zip |
| `sha256sums.txt` | SHA-256 of both archives |
| `multiple.intoto.jsonl` | SLSA provenance for the assets above |

The archives are built by `bin/make-release` from the tag: the tree is exported
with `git archive`, then re-archived with sorted entries, a fixed mtime, zeroed
ownership and no gzip or zip timestamps. The same tag produces the same bytes on
any machine. GitHub's own "Source code (…)" links are *not* used, because those
archives are regenerated server-side and their hashes have changed before.

The SLSA provenance comes from
[`.github/workflows/release.yml`](../.github/workflows/release.yml) on GitHub's
runners and covers the exact uploaded assets, so neither a rogue maintainer nor
an edited workflow can swap them afterwards.

## Verify a download

```bash
sha256sum --check --ignore-missing sha256sums.txt
slsa-verifier verify-artifact --provenance-path jaes-dead-drop-<version>.intoto.jsonl \
  --source-uri github.com/JaeSwiftxyz/jaes-dead-drop jaes-dead-drop-<version>.tar.gz
git tag --verify <version>
```

The checksum alone only proves the file is the one in `sha256sums.txt`. The SLSA
step is what binds that file to this repository and workflow. Use the
[SLSA verifier](https://github.com/slsa-framework/slsa-verifier#verification-for-github-builders);
`gh attestation verify` does not read this bundle.

Tags are signed with an **SSH key** (Ed25519), so verifiers need the signer in an
allowed-signers file before `git tag --verify` will accept it:

The signing key is published in [release-signing-key.md](release-signing-key.md)
so verification needs nothing from GitHub:

```bash
mkdir -p ~/.config/git
grep -A2 '^```$' https://raw.githubusercontent.com/JaeSwiftxyz/jaes-dead-drop/main/doc/release-signing-key.md \
  | grep '^ssh-' | sed 's|^|jae@jaeswift.xyz |' >> ~/.config/git/allowed_signers
git config --global gpg.ssh.allowedSignersFile ~/.config/git/allowed_signers
```

## Signing setup (once)

SSH signing instead of PGP: no extra software, and GitHub renders it as verified.

```bash
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global tag.gpgSign true
```

The key stays on this machine. If it is ever replaced, note it in the release
notes and keep the old key in `allowed_signers` so older tags stay verifiable.

## Checklist

1. Bump the version in `lib/Controller.php`, `Makefile`, `js/package.json`,
   `README.md`, `SECURITY.md` and add a `CHANGELOG.md` entry.
2. `php bin/update-sri`, run both test suites.
3. `git tag -s <version> -m "<version>"` and push the tag. If the tag comes out
   unsigned, `tag.gpgSign` is off — retag before continuing.
4. Wait for the workflow. It creates the draft, builds the archives, uploads
   them with `sha256sums.txt`, then attaches provenance.
5. Rebuild locally with `bin/make-release <version> dist` and diff the sums
   against the draft. They must match exactly.
6. Publish the draft.

If CI is unavailable, steps 4–5 can be done by hand: `bin/make-release`, upload
`dist/*`, and skip the provenance (say so in the notes).
