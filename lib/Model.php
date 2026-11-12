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

use JaesDeadDrop\Model\Paste;
use JaesDeadDrop\Persistence\PurgeLimiter;

/**
 * Model
 *
 * Factory of Jae's Dead Drop instance models.
 */
class Model
{
    /**
     * Configuration.
     *
     * @var Configuration
     */
    private $_conf;

    /**
     * Data storage.
     *
     * @var Data\AbstractData
     */
    private $_store = null;

    /**
     * Factory constructor.
     *
     * @param configuration $conf
     */
    public function __construct(Configuration $conf)
    {
        $this->_conf = $conf;
    }

    /**
     * Get a paste, optionally a specific instance.
     *
     * @param string $pasteId
     * @return Paste
     */
    public function getPaste($pasteId = null)
    {
        $paste = new Paste($this->_conf, $this->getStore());
        if ($pasteId !== null) {
            $paste->setId($pasteId);
        }
        return $paste;
    }

    /**
     * Checks if a purge is necessary and triggers it if yes.
     */
    public function purge()
    {
        PurgeLimiter::setConfiguration($this->_conf);
        PurgeLimiter::setStore($this->getStore());
        if (PurgeLimiter::canPurge()) {
            $this->getStore()->purge($this->_conf->getKey('batchsize', 'purge'));
        }
    }

    /**
     * Gets, and creates if neccessary, a store object
     *
     * @return Data\AbstractData
     */
    public function getStore()
    {
        if ($this->_store === null) {
            $class = 'JaesDeadDrop\\Data\\' . $this->_conf->getKey('class', 'model');
            $this->_store = new $class($this->_conf->getSection('model_options'));
        }
        return $this->_store;
    }
}
