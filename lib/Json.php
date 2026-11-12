<?php declare(strict_types=1);
/**
 * Jae's Dead Drop
 *
 * a zero-knowledge paste bin
 *
 * @link      https://github.com/JaeSwiftxyz/jaes-dead-drop
 * @copyright 2026 JaeSwift (jaeswift.xyz)
 * @license   https://www.opensource.org/licenses/zlib-license.php The zlib/libpng License
 */

namespace JaesDeadDrop;

/**
 * Json
 *
 * Provides JSON functions in an object oriented way.
 */
class Json
{
    /**
     * Returns a string containing the JSON representation of the given input
     *
     * @access public
     * @static
     * @param  mixed $input
     * @throws JsonException
     * @return string
     */
    public static function encode(&$input)
    {
        return json_encode($input, JSON_THROW_ON_ERROR);
    }

    /**
     * Returns an array with the contents as described in the given JSON input
     *
     * @access public
     * @static
     * @param  string $input
     * @throws JsonException
     * @return mixed
     */
    public static function decode(&$input)
    {
        return json_decode($input, true, 10, JSON_THROW_ON_ERROR);
    }
}
