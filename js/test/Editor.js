'use strict';
require('../common');
const fc = require('fast-check');

describe('Editor', function () {
    describe('show, hide, getText, setText & isPreview', function () {
        this.timeout(30000);

        it('returns text fed into the textarea, handles editor tabs', () => {
            fc.assert(fc.property(
                fc.string(),
                function (text) {
                    var clean = globalThis.cleanup(),
                        results = [];
                    document.body.innerHTML = (
                        '<ul id="editorTabs" class="nav nav-tabs hidden">' +
                            '<li role="presentation" class="active">' +
                                '<a id="messageedit" href="#">Editor</a>' +
                            '</li>' +
                            '<li role="presentation">' +
                                '<a id="messagepreview" href="#">Preview</a>' +
                            '</li>' +
                        '</ul>' +
                        '<div id="placeholder" class="hidden">+++ no document text +++</div>' +
                        '<div id="prettymessage" class="hidden">' +
                            '<pre id="prettyprint" class="prettyprint linenums:1"></pre>' +
                        '</div>' +
                        '<div id="plaintext" class="hidden"></div>' +
                        '<p>' +
                            '<textarea id="message" name="message" cols="80" rows="25" class="form-control hidden"></textarea>' +
                        '</p>' +
                        '<input id="messagetab" type="checkbox" checked="checked" />'
                    );
                    JaesDeadDrop.Editor.init();
                    results.push(
                        document.getElementById('editorTabs').classList.contains('hidden') &&
                        document.getElementById('message').classList.contains('hidden')
                    );
                    JaesDeadDrop.Editor.show();
                    results.push(
                        !document.getElementById('editorTabs').classList.contains('hidden') &&
                        !document.getElementById('message').classList.contains('hidden')
                    );
                    JaesDeadDrop.Editor.hide();
                    results.push(
                        document.getElementById('editorTabs').classList.contains('hidden') &&
                        document.getElementById('message').classList.contains('hidden')
                    );
                    JaesDeadDrop.Editor.show();
                    JaesDeadDrop.Editor.focusInput();
                    results.push(
                        JaesDeadDrop.Editor.getText().length === 0
                    );
                    JaesDeadDrop.Editor.setText(text);
                    results.push(
                        JaesDeadDrop.Editor.getText() === document.getElementById('message').value
                    );
                    JaesDeadDrop.Editor.setText();
                    results.push(
                        !JaesDeadDrop.Editor.isPreview() &&
                        !document.getElementById('message').classList.contains('hidden')
                    );
                    document.getElementById('messagepreview').click();
                    results.push(
                        JaesDeadDrop.Editor.isPreview() &&
                        document.getElementById('message').classList.contains('hidden')
                    );
                    document.getElementById('messageedit').click();
                    results.push(
                        !JaesDeadDrop.Editor.isPreview() &&
                        !document.getElementById('message').classList.contains('hidden')
                    );
                    clean();
                    return results.every(element => element);
                }
            ));
        });

        it('only shows the tab hint on focus and reflects the toggle state', () => {
            fc.assert(fc.property(
                fc.string(),
                function (text) {
                    const clean = globalThis.cleanup(
                        '<p id="editorhint" class="form-check">' +
                            '<input id="messagetab" type="checkbox" checked="checked" />' +
                            '<label for="messagetab"><span class="hint-on">on</span><span class="hint-off">off</span></label>' +
                        '</p>' +
                        '<textarea id="message"></textarea>'
                    );
                    JaesDeadDrop.Editor.init();
                    const hint = document.getElementById('editorhint'),
                        message = document.getElementById('message'),
                        checkbox = document.getElementById('messagetab');
                    let results = [!hint.classList.contains('is-visible')];
                    message.dispatchEvent(new Event('focus'));
                    results.push(hint.classList.contains('is-visible'));
                    message.dispatchEvent(new KeyboardEvent('keydown', { key: 'm', ctrlKey: true }));
                    results.push(hint.classList.contains('tab-off') && !checkbox.checked);
                    message.dispatchEvent(new KeyboardEvent('keydown', { key: 'm', ctrlKey: true }));
                    results.push(!hint.classList.contains('tab-off') && checkbox.checked);
                    message.dispatchEvent(new Event('blur'));
                    results.push(!hint.classList.contains('is-visible'));
                    clean();
                    return results.every(element => element);
                }
            ));
        });
    });
});
