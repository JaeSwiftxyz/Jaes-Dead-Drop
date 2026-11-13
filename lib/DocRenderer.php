<?php declare(strict_types=1);
/**
 * Jae's Dead Drop
 *
 * Renders the bundled Markdown documentation to HTML for the footer docs panel.
 * Deliberately small: only the constructs the docs use, everything escaped first.
 *
 * @link      https://github.com/JaeSwiftxyz/Jaes-Dead-Drop
 * @copyright 2026 JaeSwift (jaeswift.xyz)
 * @license   https://www.opensource.org/licenses/zlib-license.php The zlib/libpng License
 */

namespace JaesDeadDrop;

class DocRenderer
{
    /**
     * slice a section out of a document by its `### heading`
     *
     * @param  string $markdown
     * @param  string $heading heading text without the hashes
     * @return string the section body, without its heading
     */
    public static function section(string $markdown, string $heading): string
    {
        $pattern = '/^#{2,3}\s+' . preg_quote($heading, '/') . '\s*$(.*?)(?=^#{1,3}\s|\z)/ms';
        return preg_match($pattern, $markdown, $match) === 1 ? trim($match[1]) : '';
    }

    /**
     * render a restricted Markdown subset to safe HTML
     *
     * @param  string $markdown
     * @return string
     */
    public static function render(string $markdown): string
    {
        $lines = preg_split('/\r\n|\r|\n/', $markdown);
        $blocks = [];
        $paragraph = [];
        $list = null;
        $code = null;
        $table = [];

        $flushParagraph = function () use (&$paragraph, &$blocks) {
            if ($paragraph !== []) {
                $blocks[] = '<p>' . self::inline(implode(' ', $paragraph)) . '</p>';
                $paragraph = [];
            }
        };
        $flushList = function () use (&$list, &$blocks) {
            if ($list !== null) {
                $blocks[] = '</' . $list . '>';
                $list = null;
            }
        };
        $flushTable = function () use (&$table, &$blocks) {
            if ($table !== []) {
                $rows = '';
                foreach ($table as $index => $cells) {
                    $tag = $index === 0 ? 'th' : 'td';
                    $rows .= '<tr>';
                    foreach ($cells as $cell) {
                        $rows .= '<' . $tag . '>' . self::inline($cell) . '</' . $tag . '>';
                    }
                    $rows .= '</tr>';
                }
                $blocks[] = '<table>' . $rows . '</table>';
                $table = [];
            }
        };

        foreach ($lines as $line) {
            // fenced code
            if (preg_match('/^```/', $line) === 1) {
                if ($code === null) {
                    $flushParagraph();
                    $flushList();
                    $flushTable();
                    $code = [];
                } else {
                    $blocks[] = '<pre><code>' . htmlspecialchars(implode("\n", $code), ENT_QUOTES) . '</code></pre>';
                    $code = null;
                }
                continue;
            }
            if ($code !== null) {
                $code[] = $line;
                continue;
            }

            // blank line ends the current block
            if (trim($line) === '') {
                $flushParagraph();
                $flushList();
                $flushTable();
                continue;
            }

            // table row
            if (strpos($line, '|') !== false && preg_match('/^\|?[\s:|-]+\|[\s:|-]*$/', $line) === 1) {
                continue; // separator row
            }
            if (preg_match('/^\|(.+)\|$/', trim($line), $match) === 1) {
                $flushParagraph();
                $flushList();
                $table[] = array_map('trim', explode('|', $match[1]));
                continue;
            }
            $flushTable();

            // headings, `{#id}` anchor suffix becomes the id
            if (preg_match('/^(#{1,4})\s+(.*)$/', $line, $match) === 1) {
                $flushParagraph();
                $flushList();
                $level = min(strlen($match[1]) + 2, 6);
                $text = $match[2];
                $id = '';
                if (preg_match('/\s*\{#([a-z0-9-]+)\}$/i', $text, $anchor) === 1) {
                    $id = ' id="doc-' . $anchor[1] . '"';
                    $text = substr($text, 0, -strlen($anchor[0]));
                }
                $blocks[] = '<h' . $level . $id . '>' . self::inline($text) . '</h' . $level . '>';
                continue;
            }

            // horizontal rule
            if (preg_match('/^(-{3,}|\*{3,})$/', trim($line)) === 1) {
                $flushParagraph();
                $flushList();
                $blocks[] = '<hr>';
                continue;
            }

            // blockquote
            if (preg_match('/^>\s?(.*)$/', $line, $match) === 1) {
                $flushParagraph();
                $flushList();
                $blocks[] = '<blockquote><p>' . self::inline($match[1]) . '</p></blockquote>';
                continue;
            }

            // lists
            if (preg_match('/^\s*[-*+]\s+(.*)$/', $line, $match) === 1) {
                $flushParagraph();
                if ($list !== 'ul') {
                    $flushList();
                    $blocks[] = '<ul>';
                    $list = 'ul';
                }
                $blocks[] = '<li>' . self::inline($match[1]) . '</li>';
                continue;
            }
            if (preg_match('/^\s*\d+\.\s+(.*)$/', $line, $match) === 1) {
                $flushParagraph();
                if ($list !== 'ol') {
                    $flushList();
                    $blocks[] = '<ol>';
                    $list = 'ol';
                }
                $blocks[] = '<li>' . self::inline($match[1]) . '</li>';
                continue;
            }

            $flushList();
            $paragraph[] = trim($line);
        }

        if ($code !== null) {
            $blocks[] = '<pre><code>' . htmlspecialchars(implode("\n", $code), ENT_QUOTES) . '</code></pre>';
        }
        $flushParagraph();
        $flushList();
        $flushTable();

        return implode("\n", $blocks);
    }

    /**
     * inline formatting: code spans, links, bold, italics
     *
     * @param  string $text
     * @return string
     */
    private static function inline(string $text): string
    {
        $escaped = htmlspecialchars($text, ENT_QUOTES);

        // code spans are protected from the other rules
        $spans = [];
        $escaped = preg_replace_callback('/`([^`]+)`/', function ($match) use (&$spans) {
            $spans[] = '<code>' . $match[1] . '</code>';
            return "\x01" . (count($spans) - 1) . "\x02";
        }, $escaped);

        $escaped = preg_replace(
            '~\[([^\]]+)\]\(#([a-z0-9-]+)\)~',
            '<a href="#doc-$2">$1</a>',
            $escaped
        );
        $escaped = preg_replace(
            '#\[([^\]]+)\]\((https?://[^\s)]+)\)#',
            '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
            $escaped
        );
        $escaped = preg_replace('/\*\*([^*]+)\*\*/', '<strong>$1</strong>', $escaped);
        $escaped = preg_replace('/(?<!\*)\*([^*\n]+)\*(?!\*)/', '<em>$1</em>', $escaped);

        return preg_replace_callback('/\x01(\d+)\x02/', function ($match) use ($spans) {
            return $spans[(int) $match[1]];
        }, $escaped);
    }
}
