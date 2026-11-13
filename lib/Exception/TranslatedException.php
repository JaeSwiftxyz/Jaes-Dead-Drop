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

namespace JaesDeadDrop\Exception;

use Exception;
use JaesDeadDrop\I18n;

/**
 * TranslatedException
 *
 * An Exception that translates it's message.
 */
class TranslatedException extends Exception
{
    /**
     * Translating exception constructor with mandatory messageId.
     *
     * @access public
     * @param  string|array $messageId message ID or array of message ID and parameters
     * @param  int $code
     */
    public function __construct($messageId, int $code = 0)
    {
        $message = is_string($messageId) ? I18n::translate($messageId) : forward_static_call_array('JaesDeadDrop\I18n::translate', $messageId);
        parent::__construct($message, $code);
    }
}
