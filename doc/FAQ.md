# FAQ

## Contents

* [How do I download this securely?](#download)
* [Why does it claim my browser is too old?](#modern-browser)
* [Why the "insecure connection" error?](#https)
* [The loading message never goes away](#stuck-loading)
* [File and folder permissions](#permissions)
* [Cloudflare and other proxies](#cloudflare)
* [I changed the JavaScript and now nothing runs](#sri)

## How do I download this securely? {#download}

Every release publishes `sha256sums.txt` next to the archives, plus a SLSA
provenance file. Download the archive **and** the sums from the same release,
then:

```bash
sha256sum --check --ignore-missing sha256sums.txt
slsa-verifier verify-artifact --provenance-path jaes-dead-drop-<version>.intoto.jsonl \
  --source-uri github.com/JaeSwiftxyz/jaes-dead-drop jaes-dead-drop-<version>.tar.gz
```

Do not use GitHub's "Source code (…)" links for this: those archives are
generated server-side and are not what the published hash describes. The
release assets are built from the tag by `bin/make-release`.

Better still, clone the repository and check out the signed tag, so you can read
the code you run.

## Why does it claim my browser is too old? {#modern-browser}

The browser has to expose the Web Crypto API. Without it there is no local
encryption and the server would see your text. Any current Firefox, Chrome,
Edge or Safari has it. Embedded webviews (old Android, some in-app browsers)
often do not — open the link in a real browser.

## Why the "insecure connection" error? {#https}

The decryption key travels in the URL fragment, and the page that handles it
must not be tampered with. Serve the instance over HTTPS with a valid
certificate. `http://localhost` is exempt, everything else is not.

## The loading message never goes away {#stuck-loading}

Usually one of:

* a JavaScript file was blocked — check the browser console for a Content
  Security Policy or SRI error;
* the server serves a stale HTML page — hard reload;
* a proxy strips headers or rewrites paths — see [Cloudflare](#cloudflare).

## File and folder permissions {#permissions}

The PHP process needs to read the application directory and read/write the data
directory. Nothing else needs write access. On a Debian-style host:

```bash
chown -R www-data:www-data /var/lib/dead-drop
chmod -R u+rwX,go-rwx /var/lib/dead-drop
```

Keep the data directory outside the web root so the encrypted blobs are never
served directly.

## Cloudflare and other proxies {#cloudflare}

Proxies that rewrite HTML, inject scripts or strip headers break the page. With
Cloudflare, disable Rocket Loader and HTML minification for the instance, or
exclude it with a page rule. The same applies to proxy "optimisers".

## I changed the JavaScript and now nothing runs {#sri}

Subresource Integrity hashes are pinned in `lib/Configuration.php`. A file whose
hash does not match is refused by the browser, silently. After editing anything
under `js/`, run:

```bash
php bin/update-sri
```
