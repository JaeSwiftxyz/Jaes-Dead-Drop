<?php declare(strict_types=1);
/**
 * Jae's Dead Drop
 *
 * @link      https://github.com/JaeSwiftxyz/jaes-dead-drop
 * @copyright 2026 JaeSwift (jaeswift.xyz)
 * @license   https://www.opensource.org/licenses/zlib-license.php The zlib/libpng License
 */

namespace JaesDeadDrop;

use PHPUnit\Framework\TestCase;

class DocRendererTest extends TestCase
{
    public function testEscapesRawHtml(): void
    {
        $html = DocRenderer::render('<script>alert(1)</script> and 1 < 2');
        $this->assertStringNotContainsString('<script>', $html);
        $this->assertStringContainsString('&lt;script&gt;', $html);
        $this->assertStringContainsString('1 &lt; 2', $html);
    }

    public function testRendersHeadingsWithAnchors(): void
    {
        $html = DocRenderer::render('## Why the error? {#error}');
        $this->assertStringContainsString('<h4 id="doc-error">Why the error?</h4>', $html);
    }

    public function testRendersListsCodeAndLinks(): void
    {
        $html = DocRenderer::render("- one\n- two\n\n```\ncode here\n```\n\n[site](https://example.com)");
        $this->assertStringContainsString('<ul>', $html);
        $this->assertStringContainsString('<li>one</li>', $html);
        $this->assertStringContainsString('<pre><code>code here</code></pre>', $html);
        $this->assertStringContainsString('rel="noopener noreferrer"', $html);
    }

    public function testInDocumentLinksStayLocal(): void
    {
        $html = DocRenderer::render('[jump](#error)');
        $this->assertStringContainsString('<a href="#doc-error">jump</a>', $html);
        $this->assertStringNotContainsString('target="_blank"', $html);
    }

    public function testSectionExtractsOnlyTheSection(): void
    {
        $markdown = "## One\nfirst\n\n### Two\nsecond\n\n### Three\nthird";
        $this->assertSame('second', DocRenderer::section($markdown, 'Two'));
        $this->assertSame('', DocRenderer::section($markdown, 'Missing'));
    }

    public function testTableSeparatorIsNotContent(): void
    {
        $html = DocRenderer::render("| a | b |\n| --- | --- |\n| 1 | 2 |");
        $this->assertSame(2, substr_count($html, '<tr>'));
        $this->assertStringContainsString('<th>a</th>', $html);
        $this->assertStringContainsString('<td>1</td>', $html);
    }
}
