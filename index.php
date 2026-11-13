<?php declare(strict_types=1);
/**
 * Jae's Dead Drop
 *
 * a zero-knowledge paste bin
 *
 * @link      https://github.com/JaeSwiftxyz/Jaes-Dead-Drop
 * @copyright 2026 JaeSwift (jaeswift.xyz)
 * @license   https://www.opensource.org/licenses/zlib-license.php The zlib/libpng License
 */

// change this, if your php files and data is outside of your webservers document root
define('PATH', __DIR__ . DIRECTORY_SEPARATOR);

define('PUBLIC_PATH', __DIR__);
require PATH . 'vendor' . DIRECTORY_SEPARATOR . 'autoload.php';
new JaesDeadDrop\Controller;
