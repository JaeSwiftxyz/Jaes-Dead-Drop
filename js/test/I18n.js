'use strict';
const common = require('../common');
const fc = require('fast-check');

describe('I18n', function () {
    describe('translate', function () {
        this.timeout(30000);
        before(function () {
            JaesDeadDrop.I18n.reset();
        });

        it('returns message ID unchanged if no translation found', () => {
            fc.assert(fc.property(
                fc.string(),
                function (messageId) {
                    messageId   = common.removePlaceholders(messageId);
                    const plurals = [messageId, messageId + 's'],
                          fake    = [messageId],
                          result  = JaesDeadDrop.I18n.translate(messageId);
                    JaesDeadDrop.I18n.reset();

                    const alias = JaesDeadDrop.I18n._(messageId);
                    JaesDeadDrop.I18n.reset();

                    const pluralResult = JaesDeadDrop.I18n.translate(plurals);
                    JaesDeadDrop.I18n.reset();

                    const pluralAlias = JaesDeadDrop.I18n._(plurals);
                    JaesDeadDrop.I18n.reset();

                    const fakeResult = JaesDeadDrop.I18n.translate(fake);
                    JaesDeadDrop.I18n.reset();

                    const fakeAlias = JaesDeadDrop.I18n._(fake);
                    JaesDeadDrop.I18n.reset();

                    if (messageId.indexOf('<a') === -1) {
                        messageId = JaesDeadDrop.Helper.htmlEntities(messageId);
                    } else {
                        messageId = DOMPurify.sanitize(
                            messageId, {
                                ALLOWED_TAGS: ['a', 'i', 'span'],
                                ALLOWED_ATTR: ['href', 'id']
                            }
                        );
                    }
                    return messageId === result && messageId === alias &&
                        messageId === pluralResult && messageId === pluralAlias &&
                        messageId === fakeResult && messageId === fakeAlias;
                }
            ));
        });
        it('replaces %s in strings with first given parameter, encoding all, when no link is in the messageID', () => {
            fc.assert(fc.property(
                fc.string(),
                fc.array(fc.string(), {minLength: 1}),
                fc.string(),
                function (prefix, params, postfix) {
                    prefix    =    common.removePlaceholders(prefix).replace(/<a/g, '');
                    params[0] = common.removePlaceholders(params[0]);
                    postfix   =   common.removePlaceholders(postfix).replace(/<a/g, '');
                    const translation = JaesDeadDrop.Helper.htmlEntities(prefix + params[0] + postfix);
                    params.unshift(prefix + '%s' + postfix);
                    const result = JaesDeadDrop.I18n.translate.apply(this, params);
                    JaesDeadDrop.I18n.reset();
                    const alias = JaesDeadDrop.I18n._.apply(this, params);
                    JaesDeadDrop.I18n.reset();
                    return translation === result && translation === alias;
                }
            ));
        });
        it('replaces %s in strings with first given parameter, encoding params only, when a link is part of the messageID', () => {
            fc.assert(fc.property(
                fc.string(),
                fc.array(fc.string(), {minLength: 1}),
                fc.string(),
                function (prefix, params, postfix) {
                    prefix    =    common.removePlaceholders(prefix);
                    params[0] = common.removePlaceholders(params[0]);
                    postfix   =   common.removePlaceholders(postfix);
                    const translation = DOMPurify.sanitize(
                        prefix + '<a href="' + params[0] + '"></a>' + postfix, {
                            ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|magnet):)/i,
                            ALLOWED_TAGS: ['a', 'i', 'span', 'kbd'],
                            ALLOWED_ATTR: ['href', 'id']
                        }
                    );
                    params.unshift(prefix + '<a href="%s"></a>' + postfix);
                    const result = JaesDeadDrop.I18n.translate.apply(this, params);
                    JaesDeadDrop.I18n.reset();
                    const alias = JaesDeadDrop.I18n._.apply(this, params);
                    JaesDeadDrop.I18n.reset();
                    return translation === result && translation === alias;
                }
            ));
        });
        it('replaces %s in strings with first given parameter into an element, encoding all, when no link is in the messageID', () => {
            fc.assert(fc.property(
                fc.string(),
                fc.array(fc.string(), {minLength: 1}),
                fc.string(),
                function (prefix, params, postfix) {
                    prefix    =    common.removePlaceholders(prefix).replace(/<a/g, '');
                    params[0] = common.removePlaceholders(params[0]);
                    postfix   =   common.removePlaceholders(postfix).replace(/<a/g, '');
                    const tempDiv = document.createElement('textarea');
                    tempDiv.textContent = (prefix + params[0] + postfix);
                    const translation = tempDiv.textContent;
                    let args = Array.prototype.slice.call(params);
                    args.unshift(prefix + '%s' + postfix);
                    let clean = globalThis.cleanup();
                    document.body.innerHTML = '<div id="i18n"></div>';
                    const i18nElement = document.getElementById('i18n');
                    args.unshift(i18nElement);
                    JaesDeadDrop.I18n.translate.apply(this, args);
                    const result = i18nElement.textContent;
                    JaesDeadDrop.I18n.reset();
                    clean();
                    clean = globalThis.cleanup();
                    document.body.innerHTML = '<div id="i18n"></div>';
                    args[0] = document.getElementById('i18n');
                    JaesDeadDrop.I18n._.apply(this, args);
                    const alias = document.getElementById('i18n').textContent;
                    JaesDeadDrop.I18n.reset();
                    clean();
                    return translation === result && translation === alias;
                }
            ));
        });
        it('replaces %s in strings with first given parameter into an element, encoding params only, when a link is part of the messageID inserted', () => {
            fc.assert(fc.property(
                fc.string(),
                fc.array(fc.string(), {minLength: 1}),
                fc.string(),
                function (prefix, params, postfix) {
                    prefix    =    common.removePlaceholders(prefix).trim();
                    params[0] = common.removePlaceholders(params[0]).trim();
                    postfix   =   common.removePlaceholders(postfix).trim();
                    const translation = DOMPurify.sanitize(
                        prefix + '<a href="' + params[0] + '"></a>' + postfix, {
                            ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|magnet):)/i,
                            ALLOWED_TAGS: ['a', 'i', 'span', 'kbd'],
                            ALLOWED_ATTR: ['href', 'id']
                        }
                    );
                    let args = Array.prototype.slice.call(params);
                    args.unshift(prefix + '<a href="%s"></a>' + postfix);
                    let clean = globalThis.cleanup();
                    document.body.innerHTML = '<div id="i18n"></div>';
                    const i18nElement2 = document.getElementById('i18n');
                    args.unshift(i18nElement2);
                    JaesDeadDrop.I18n.translate.apply(this, args);
                    const result = i18nElement2.innerHTML;
                    JaesDeadDrop.I18n.reset();
                    clean();
                    clean = globalThis.cleanup();
                    document.body.innerHTML = '<div id="i18n"></div>';
                    args[0] = document.getElementById('i18n');
                    JaesDeadDrop.I18n._.apply(this, args);
                    const alias = document.getElementById('i18n').innerHTML;
                    JaesDeadDrop.I18n.reset();
                    clean();
                    return translation === result && translation === alias;
                }
            ));
        });
    });

    describe('getPluralForm', function () {
        before(function () {
            JaesDeadDrop.I18n.reset();
        });

        it('returns valid key for plural form', () => {
            fc.assert(fc.property(
                common.fcSupportedLanguages(),
                fc.integer(),
                function(language, n) {
                    JaesDeadDrop.I18n.reset(language);
                    const result = JaesDeadDrop.I18n.getPluralForm(n);
                    // arabic seems to have the highest plural count with 6 forms
                    return result >= 0 && result <= 5;
                }
            ));
        });

        it('routes Lithuanian cardinal forms by the last digit', () => {
            JaesDeadDrop.I18n.reset('lt');
            assert.strictEqual(JaesDeadDrop.I18n.getPluralForm(1), 0);
            assert.strictEqual(JaesDeadDrop.I18n.getPluralForm(2), 1);
            assert.strictEqual(JaesDeadDrop.I18n.getPluralForm(10), 2);
            assert.strictEqual(JaesDeadDrop.I18n.getPluralForm(22), 1);
            assert.strictEqual(JaesDeadDrop.I18n.getPluralForm(110), 2);
            assert.strictEqual(JaesDeadDrop.I18n.getPluralForm(111), 2);
            assert.strictEqual(JaesDeadDrop.I18n.getPluralForm(120), 2);
        });
    });

    // loading of JSON via AJAX needs to be tested in the browser, this just mocks it
    // TODO: This needs to be tested using a browser.
    describe('loadTranslations', function () {
        this.timeout(30000);
        before(function () {
            JaesDeadDrop.I18n.reset();
        });

        it('downloads and handles any supported language', () => {
            fc.assert(fc.property(
                common.fcSupportedLanguages(),
                function(language) {
                    // cleanup
                    let clean = globalThis.cleanup('', {cookie: ['lang=en']});
                    JaesDeadDrop.I18n.reset('en');
                    JaesDeadDrop.I18n.loadTranslations();
                    clean();

                    // mock
                    clean = globalThis.cleanup('', {cookie: ['lang=' + language]});
                    // eslint-disable-next-line global-require
                    JaesDeadDrop.I18n.reset(language, require('../../i18n/' + language + '.json'));
                    const loadedLang = JaesDeadDrop.I18n.getLanguage(),
                          result     = JaesDeadDrop.I18n.translate('Never'),
                          alias      = JaesDeadDrop.I18n._('Never');
                    clean();
                    return language === loadedLang && result === alias;
                }
            ));
        });

        it('maps Traditional Chinese browser languages to zh-tw', async function () {
            const clean = globalThis.cleanup('<script src="js/jaes-dead-drop.js"></script>', {url: 'https://jaeswift.xyz/tools/dead-drop/'});

            // loadTranslations() loads the translation file via fetch() API,
            // which is asynchronous. Stub it, so the test does not perform a
            // real network request, and await the 'languageLoaded' event that
            // loadTranslations() dispatches once the fetch has completed.
            const originalFetch = globalThis.fetch;
            globalThis.fetch = function (url) {
                assert.strictEqual(url, 'i18n/zh-tw.json');
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    statusText: 'OK',
                    json: function () {
                        return Promise.resolve({});
                    }
                });
            };

            try {
                for (const language of ['zh-TW', 'zh-TW-u-nu-hanidec', 'zh-Hant', 'zh-Hant-TW', 'zh-HK', 'zh-MO']) {
                    Object.defineProperty(navigator, 'language', {
                        value: language,
                        configurable: true
                    });
                    JaesDeadDrop.I18n.reset('en');
                    const loaded = new Promise(function (resolve) {
                        document.addEventListener('languageLoaded', resolve, {once: true});
                    });
                    JaesDeadDrop.I18n.loadTranslations();
                    await loaded;
                    assert.strictEqual(JaesDeadDrop.I18n.getLanguage(), 'zh-tw', language);
                }
            } finally {
                globalThis.fetch = originalFetch;
                delete navigator.language;
                JaesDeadDrop.I18n.reset();
                clean();
            }
        });

        it('should default to en', () => {
            const clean = globalThis.cleanup('', {url: 'https://jaeswift.xyz/tools/dead-drop/'});

            // when navigator.userLanguage is undefined and no default language
            // is specified, it would throw an error
            [ 'language', 'userLanguage' ].forEach(function (key) {
                Object.defineProperty(navigator, key, {
                    value: undefined,
                    configurable: true,
                    enumerable: true,
                    writable: false
                });
            });

            JaesDeadDrop.I18n.reset('en');
            JaesDeadDrop.I18n.loadTranslations();
            const result = JaesDeadDrop.I18n.translate('Never'),
                  alias  = JaesDeadDrop.I18n._('Never');

            clean();
            return 'Never' === result && 'Never' === alias;
        });
    });

    describe('onLanguageLoaded', function () {
        before(function () {
            JaesDeadDrop.I18n.reset();
        });

        it('invokes the callback when the languageLoaded event is dispatched', function () {
            let called = false;
            JaesDeadDrop.I18n.onLanguageLoaded(function () {
                called = true;
            });
            assert.strictEqual(called, false);
            document.dispatchEvent(new CustomEvent('languageLoaded'));
            assert.strictEqual(called, true);
        });
    });
});
