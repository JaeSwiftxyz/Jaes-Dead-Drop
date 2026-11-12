# Installation

## TL;DR

Download the
[latest release archive](https://github.com/JaeSwiftxyz/jaes-dead-drop/releases/latest)
(with the link labelled as "Source code (…)") and extract it in your web hosts
folder where you want to install your Jae's Dead Drop instance. We try to provide a
mostly safe default configuration, but we urge you to check the
[security section](#hardening-and-security) below and the
[configuration options](#configuration) to adjust as you see fit.

**NOTE:** See our [FAQ entry on securely downloading release files](https://github.com/JaeSwiftxyz/jaes-dead-drop/blob/main/doc/FAQ.md#download)
for more information.

### Container deployment

The application is plain PHP with no build step, so any PHP 8.3-FPM + nginx (or
php-fpm + Apache) image works unchanged. Two things matter:

* point the document root at the application directory and route through
  `index.php`,
* mount a writable data directory from outside the web root and set
  `[model_options] dir` to it, plus `fastcgi_param CONFIG_PATH` (or an
  equivalent env var) at the config directory.

A minimal compose sketch:

```yaml
services:
  dead-drop:
    image: php:8.3-fpm-alpine   # any image with the gd and fileinfo extensions
    volumes:
      - ./app:/var/www/html
      - ./data:/var/lib/dead-drop
      - ./conf:/etc/dead-drop
```

Put nginx in front with `try_files $uri $uri/ /index.php?$query_string` and
`CONFIG_PATH=/etc/dead-drop/`, then open the site once to confirm the data
directory is writable.

### Minimal Requirements

- PHP version 7.4 or above
- PHP with zlib extension
- some disk space and the capability to create files and folders in the
  installation directory and the `PATH` defined in index.php
- A web browser with JavaScript support enabled

### Optional Requirements

- PHP with GD extension (when using identicon or vizhash icons, jdenticon works
  without it) and OPcache (for better performance)
- a database supported by [PHP PDO](https://php.net/manual/book.pdo.php) and the
  PHP PDO extension (when using database storage)
- a Ceph cluster with Rados gateway or AWS S3 storage (when using S3 storage)
- Google Cloud Storage (when using GCP storage)
- A web browser with WebAssembly support

## Hardening and Security

### Changing the Path

In the index.php you can define a different `PATH`. This is useful to secure
your installation. You can move the utilities, configuration, data files,
templates and PHP libraries (directories bin, cfg, doc, data, lib, tpl, tst and
vendor) outside of your document root. This new location must still be
accessible to your webserver and PHP process (see also
[open_basedir setting](https://secure.php.net/manual/en/ini.core.php#ini.open-basedir)).

> #### PATH Example
> Your Jae's Dead Drop installation lives in a subfolder called "paste" inside of
> your document root. The URL looks like this:
> http://example.com/paste/
>
> The full path of Jae's Dead Drop on your webserver is:
> /srv/example.com/htdocs/paste
>
> When setting the path like this:
> define('PATH', '../../secret/jaes-dead-drop/');
>
> Jae's Dead Drop will look for your includes and data here:
> /srv/example.com/secret/jaes-dead-drop

### Changing the config path only

In situations where you want to keep the Jae's Dead Drop static files separate from the
rest of your data, or you want to reuse the installation files on multiple vhosts,
you may only want to change the `conf.php`. In this case, you can set the
`CONFIG_PATH` environment variable to the absolute path to the directory containing the `conf.php` file.
This can be done in your web server's virtual host config, the PHP config, or in
the index.php, if you choose to customize it.

Note that your PHP process will need read access to the configuration file,
wherever it may be.

> #### CONFIG_PATH example
> Setting the value in an Apache Vhost:
> SetEnv CONFIG_PATH /var/lib/jaes-dead-drop/
>
> In a php-fpm pool config:
> env[CONFIG_PATH] = /var/lib/jaes-dead-drop/
>
> In the index.php, near the top:
> putenv('CONFIG_PATH=/var/lib/jaes-dead-drop/');

### Transport security

When setting up Jae's Dead Drop, also set up HTTPS, if you haven't already. Without
HTTPS Jae's Dead Drop is not secure, as the JavaScript or WebAssembly files could be
manipulated during transmission. For more information on this, see our
[FAQ entry on HTTPS setup recommendations](https://github.com/JaeSwiftxyz/jaes-dead-drop/blob/main/doc/FAQ.md#https).

### File-level permissions

After completing the installation, you should make sure, that other users on the
system cannot read the config file or the `data/` directory, as – depending on
your configuration – potentially sensitive information may be stored in there.

See our [FAQ entry on permissions](https://github.com/JaeSwiftxyz/jaes-dead-drop/blob/main/doc/FAQ.md#permissions)
for a detailed guide on how to "harden" access to files and folders.

## Configuration

In the file `cfg/conf.php` you can configure JaesDeadDrop. A `cfg/conf.sample.php`
is provided containing all options and their default values. You can copy it to
`cfg/conf.php` and change it as needed. Alternatively you can copy it anywhere
and set the `CONFIG_PATH` environment variable (see above notes). The config
file is divided into multiple sections, which are enclosed in square brackets.

In the `[main]` section you can enable or disable the discussion feature, set
the limit of stored pastes and comments in bytes. The `[traffic]` section lets
you set a time limit in seconds. Users may not post more often than this limit
to your Jae's Dead Drop installation.

More details can be found in the
[configuration documentation](https://github.com/JaeSwiftxyz/jaes-dead-drop/blob/main/cfg/conf.sample.php).

## Advanced installation

### Templates

Templates live in `tpl/`, styles for each in `css/`. Copy `tpl/bootstrap5.php`
and `css/bootstrap5/` under new names, adjust the markup, then list the result in
`availabletemplates` in the `[main]` section of the configuration. Add the
matching `css/<name>/` directory or the page renders unstyled.

### Translations

Copy `i18n/en.json`, translate the values, keep every key untouched, and save as
`i18n/<language-code>.json`. `I18n` picks up any file whose code matches the
browser's `Accept-Language`, so a new file is live immediately. Missing keys fall
back to English.

### Web server configuration

A `robots.txt` file is provided in the root dir of JaesDeadDrop. It requests bots
such as search engines and other automation tools to not index or crawl your
site, so the paste keys are not leaked. It is recommended to place it into
the root of your web directory if you have installed Jae's Dead Drop in a subdirectory.
Make sure to adjust it, so that the file paths match your installation. Of course
you can also adjust an existing `robots.txt` file. More bot detection is
implemented in JavaScript, but note none of these mechanisms is a 100% fail-safe
way to prevent non-human visitors on your site.

#### Server-side User-Agent blocking

Client-side checks and `robots.txt` only help after a request reaches Jae's Dead Drop
(or when a crawler chooses to honour `robots.txt`). You can additionally reject
obvious crawler User-Agents in the web server, before PHP runs. That reduces
noise in logs and lowers the chance that automated clients fetch paste URLs.

A `.htaccess.disabled` file is provided in the root dir of JaesDeadDrop. It blocks
some known robots and link-scanning bots. If you use Apache, you can rename the
file to `.htaccess` to enable this feature. The shipped rules return HTTP 403
when the User-Agent matches patterns such as `bot`, `spider`, `crawl`, embedded
URLs, WhatsApp, Skype preview, or `facebookexternalhit`, while still allowing
the Let's Encrypt validation User-Agent.

If you use another web server, configure an equivalent deny list manually.
For nginx, a `map` based on `$http_user_agent` is a common approach:

```nginx
map $http_user_agent $jdd_bad_bot {
    default                                                 0;
    ~*Let's Encrypt validation server                        0;
    ~*(?:bot|spider|crawl|https?://|WhatsApp|SkypeUriPreview|facebookexternalhit) 1;
}

server {
    # ... existing Jae's Dead Drop server block ...

    if ($jdd_bad_bot) {
        return 403;
    }
}
```

Tune the patterns for your environment. Broad matches such as `bot` can block
legitimate tools or uptime monitors that put those substrings in their
User-Agent. Prefer keeping health checks on simple HTTPS GETs that do not need
to execute the client-side JavaScript bot detection.

In a container setup apply the same idea in the image's web-server config.

### On using Cloudflare

If you want to use Jae's Dead Drop behind Cloudflare, make sure you have disabled the
Rocket loader and unchecked "Javascript" for Auto Minify, found in your domain
settings, under "Speed". More information can be found in our
[FAQ entry on Cloudflare related issues](https://github.com/JaeSwiftxyz/jaes-dead-drop/blob/main/doc/FAQ.md#cloudflare).

### Using a Database Instead of Flat Files

In the configuration file the `[model]` and `[model_options]` sections let you
configure your favourite way of storing the pastes and discussions on your
server.

`Filesystem` is the default model, which stores everything in files in the
data folder. This is the recommended setup for most sites on single hosts.

Under high load, in distributed setups or if you are not allowed to store files
locally, you might want to switch to the `Database` model. This lets you
store your data in a database. Basically all databases that are supported by
[PDO](https://secure.php.net/manual/en/book.pdo.php) may be used. Automatic table
creation is provided for `pdo_ibm`, `pdo_informix`, `pdo_mssql`, `pdo_mysql`,
`pdo_oci`, `pdo_pgsql` and `pdo_sqlite`. You may want to provide a table prefix,
if you have to share the Jae's Dead Drop database with another application or you want
to use a prefix for
[security reasons](https://security.stackexchange.com/questions/119510/is-using-a-db-prefix-for-tables-more-secure).
The table prefix option is called `tbl`.

> #### Note
> The `Database` model has only been tested with SQLite, MariaDB/MySQL and
> PostgreSQL, although it would not be recommended to use SQLite in a production
> environment. If you gain any experience running Jae's Dead Drop on other RDBMS,
> please let us know.

The following GRANTs (privileges) are required for the Jae's Dead Drop user in
**MariaDB/MySQL**. In normal operation:
- INSERT, SELECT, DELETE on the paste and comment tables
- SELECT on the config table

If you want Jae's Dead Drop to handle table creation (when you create the first paste)
and updates (after you update Jae's Dead Drop to a new release), you need to give the
user these additional privileges:
- CREATE, INDEX and ALTER on the database
- INSERT and UPDATE on the config table

For reference or if you want to create the table schema for yourself to avoid
having to give Jae's Dead Drop too many permissions (replace `prefix_` with your own
table prefix and create the table schema with your favorite MariaDB/MySQL
client):

```sql
CREATE TABLE prefix_paste (
    dataid CHAR(16) NOT NULL,
    data MEDIUMBLOB,
    expiredate INT,
    meta TEXT,
    PRIMARY KEY (dataid)
);

CREATE TABLE prefix_comment (
    dataid CHAR(16),
    pasteid CHAR(16),
    parentid CHAR(16),
    data BLOB,
    vizhash BLOB,
    postdate INT,
    PRIMARY KEY (dataid)
);
CREATE INDEX parent ON prefix_comment(pasteid);

CREATE TABLE prefix_config (
    id CHAR(16) NOT NULL, value TEXT, PRIMARY KEY (id)
);
INSERT INTO prefix_config VALUES('VERSION', '1.0.0');
```

In **PostgreSQL**, the `data`, `attachment`, `nickname` and `vizhash` columns
need to be `TEXT` and not `BLOB` or `MEDIUMBLOB`. The key names in brackets,
after `PRIMARY KEY`, need to be removed.

In **Oracle**, the `data`, `attachment`, `nickname` and `vizhash` columns need
to be `CLOB` and not `BLOB` or `MEDIUMBLOB`, the `id` column in the `config`
table needs to be `VARCHAR2(16)` and the `meta` column in the `paste` table
and the `value` column in the `config` table need to be `VARCHAR2(4000)`.

### Cloud Storage Backends

Due to the large size of the respective cloud SDKs required for these, we didn't
include these in the `vendor` directory shipped in our release archives. To use
these in your manual installation, you will need [composer installed](https://getcomposer.org/)
and require the used library (see instructions below).

This is not required if using the dedicated container images that have these SDKs
preinstalled.

#### Using Google Cloud Storage
If you want to deploy Jae's Dead Drop in a serverless manner in the Google Cloud, you
can choose the `GoogleCloudStorage` as backend.

To use this backend, you first have to install the SDK from the installation
directory of Jae's Dead Drop:

```console
composer require --no-update google/cloud-storage
composer update --no-dev --optimize-autoloader
```

You have to create a GCS bucket and specify the name as the model option `bucket`.
Alternatively, you can set the name through the environment variable `JDD_GCS_BUCKET`.

The default prefix for pastes stored in the bucket is `pastes`. To change the
prefix, specify the option `prefix`.

Google Cloud Storage buckets may be significantly slower than a `FileSystem` or
`Database` backend. The big advantage is that the deployment on Google Cloud
Platform using Google Cloud Run is easy and cheap.

#### Using S3 Storage
Similar to Google Cloud Storage, you can choose S3 as storage backend. It uses
the AWS SDK for PHP, but can also talk to a Rados gateway as part of a Ceph
cluster.

To use this backend, you first have to install the SDK from the installation
directory of Jae's Dead Drop:

```console
composer require --no-update aws/aws-sdk-php
composer update --no-dev --optimize-autoloader
```

You have to create an S3 bucket on the Ceph cluster before using the S3 backend.

In the `[model]` section of cfg/conf.php, set `class` to `S3Storage`.

You can set any combination of the following options in the `[model_options]`
section:

  * region
  * version
  * endpoint
  * bucket
  * prefix
  * accesskey
  * secretkey
  * use_path_style_endpoint

By default, prefix is empty. If set, the S3 backend will place all Jae's Dead Drop
data beneath this prefix.

For AWS, you have to provide at least `region`, `bucket`, `accesskey`, and
`secretkey`.

For Ceph, follow this example:

```
region = ""
version = "2006-03-01"
endpoint = "https://s3.my-ceph.invalid"
use_path_style_endpoint = true
bucket = "my-bucket"
accesskey = "my-rados-user"
secretkey = "my-rados-pass"
```
