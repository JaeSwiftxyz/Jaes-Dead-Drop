# Jae's Dead Drop

*Current version: 1.0.0* · live at <https://jaeswift.xyz/tools/dead-drop/>

**Jae's Dead Drop** is a minimalist, open source online
[pastebin](https://en.wikipedia.org/wiki/Pastebin) where the server has zero
knowledge of stored data. It is a dark, lime-accented build aimed at people who
want a paste link to be the only thing they have to hand over.

Data is encrypted and decrypted in the browser using 256bit AES in
[Galois Counter mode](https://en.wikipedia.org/wiki/Galois/Counter_Mode), so the
key never reaches the server.

## This build

## What it provides

+ As a server administrator you don't have to worry if your users post content
  that is considered illegal in your country. You have plausible deniability of
  any of the pastes content. If requested or enforced, you can delete any paste
  from your system.

+ Pastebin-like system to store text documents, code samples, etc.

+ Encryption of data sent to server.

+ Possibility to set a password which is required to read the paste. It further
  protects a paste and prevents people stumbling upon your paste's link
  from being able to read it without the password.

## What it doesn't provide

- As a user you have to trust the server administrator not to inject any
  malicious code. For security, a Jae's Dead Drop installation *has to be used over*
  *HTTPS*! Otherwise you would also have to trust your internet provider, and
  any jurisdiction the traffic passes through. Additionally the instance should
  be secured by
  [HSTS](https://en.wikipedia.org/wiki/HTTP_Strict_Transport_Security). It can
  use traditional certificate authorities and/or use a
  [DNSSEC](https://en.wikipedia.org/wiki/Domain_Name_System_Security_Extensions)
  protected
  [DANE](https://en.wikipedia.org/wiki/DNS-based_Authentication_of_Named_Entities)
  record.

- The “key” used to encrypt the paste is part of the URL (in
  [the fragment part separated by the `#`](https://en.wikipedia.org/wiki/URL#fragment)).
  If you publicly post the URL of a paste that is not password-protected, anyone
  can read it.
  Use a password if you want your paste to remain private. In that case, make
  sure to use a strong password and share it privately and end-to-end-encrypted.

- In case of a server breach your data is secure as it is only stored encrypted
  on the server.

## Options

Some features are optional and can be enabled or disabled in the [configuration
file](https://github.com/JaeSwiftxyz/Jaes-Dead-Drop/blob/main/cfg/conf.sample.php):

* Password protection

* Discussions, anonymous or with nicknames and IP based identicons or vizhashes

* Expiration times, including a "forever" and "burn after reading" option

* Markdown format support for HTML formatted pastes, including preview function

* Syntax highlighting for source code using prettify.js, including 4 prettify
  themes

* File upload support, image, media and PDF preview (disabled by default, size
  limit adjustable)

* Templates: By default there are bootstrap5, bootstrap CSS and darkstrap
  to choose from and it is easy to adapt these to your own websites layout or
  create your own.

* Translation system and automatic browser language detection (if enabled in
  browser)

* Language selection (disabled by default, as it uses a session cookie)

* QR code for paste URLs, to easily transfer them over to mobile devices

## Further resources

* [FAQ](https://github.com/JaeSwiftxyz/Jaes-Dead-Drop/blob/main/doc/FAQ.md)

* [Installation guide](https://github.com/JaeSwiftxyz/Jaes-Dead-Drop/blob/main/doc/Installation.md#installation)

* [Configuration guide](https://github.com/JaeSwiftxyz/Jaes-Dead-Drop/blob/main/cfg/conf.sample.php)

* [Templates](https://github.com/JaeSwiftxyz/Jaes-Dead-Drop/blob/main/doc/Installation.md#templates)

* [Translation guide](https://github.com/JaeSwiftxyz/Jaes-Dead-Drop/blob/main/doc/Installation.md#translations)

* [Developer guide](https://github.com/JaeSwiftxyz/Jaes-Dead-Drop/blob/main/doc/Running%20Unit%20Tests.md)

Run into any issues? Have ideas for further developments? Please
[report](https://github.com/JaeSwiftxyz/Jaes-Dead-Drop/issues) them!
