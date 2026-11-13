<?php declare(strict_types=1);
/**
 * Jae's Dead Drop
 *
 * Serves the bundled documentation for the footer docs panel.
 *
 * @link      https://github.com/JaeSwiftxyz/Jaes-Dead-Drop
 * @copyright 2026 JaeSwift (jaeswift.xyz)
 * @license   https://www.opensource.org/licenses/zlib-license.php The zlib/libpng License
 */

use JaesDeadDrop\DocRenderer;

define('PATH', __DIR__ . DIRECTORY_SEPARATOR);
require PATH . 'vendor' . DIRECTORY_SEPARATOR . 'autoload.php';

$docs = [
    'faq' => ['FAQ', 'doc/FAQ.md', null],
    'installation' => ['Installation', 'doc/Installation.md', null],
    'configuration' => ['Configuration', 'cfg/conf.sample.php', null],
    'templates' => ['Templates', 'doc/Installation.md', 'Templates'],
    'translation' => ['Translation', 'doc/Installation.md', 'Translations'],
    'tests' => ['Unit tests', 'doc/Running Unit Tests.md', null],
];

$key = isset($_GET['doc']) && is_string($_GET['doc']) ? $_GET['doc'] : '';
if (!array_key_exists($key, $docs)) {
    http_response_code(404);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'unknown document']);
    exit;
}

[$title, $file, $section] = $docs[$key];
$path = PATH . $file;
if (!is_file($path)) {
    http_response_code(404);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'documentation not deployed']);
    exit;
}

$markdown = (string) file_get_contents($path);

if ($section !== null) {
    $body = DocRenderer::section($markdown, $section);
} elseif ($key === 'installation') {
    // the guide is long; the panel opens at its own TL;DR
    $body = DocRenderer::section($markdown, 'TL;DR');
} else {
    // drop the document title, the panel shows it already
    $body = preg_replace('/^#\s+[^\n]*\n/', '', $markdown);
}

if ($key === 'configuration') {
    // strip the PHP-comment shell of the sample, keep the ini
    $body = preg_replace('/^;<\?php.*?\/\*/s', '', $body);
    $body = preg_replace('/\*\/\s*$/', '', $body);
    $html = '<pre class="doc-sample"><code>' . htmlspecialchars(trim($body), ENT_QUOTES) . '</code></pre>';
} else {
    $html = DocRenderer::render($body);
}

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=300');
echo json_encode(['title' => $title, 'html' => $html], JSON_UNESCAPED_SLASHES);
