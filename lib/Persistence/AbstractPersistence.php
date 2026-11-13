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

namespace JaesDeadDrop\Persistence;

use JaesDeadDrop\Data\AbstractData;

/**
 * AbstractPersistence
 *
 * persists data in PHP files
 */
abstract class AbstractPersistence
{
    /**
     * data storage to use to persist something
     *
     * @access private
     * @static
     * @var AbstractData
     */
    protected static $_store;

    /**
     * set the path
     *
     * @access public
     * @static
     * @param  AbstractData $store
     */
    public static function setStore(AbstractData $store)
    {
        self::$_store = $store;
    }
}
