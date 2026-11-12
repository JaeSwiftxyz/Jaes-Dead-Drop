'use strict';
/**
 * Jae's Dead Drop
 *
 * Footer docs tabs: opens one bundled document inline, one at a time.
 *
 * @link      https://github.com/JaeSwiftxyz/jaes-dead-drop
 * @copyright 2026 JaeSwift (jaeswift.xyz)
 * @license   https://www.opensource.org/licenses/zlib-license.php The zlib/libpng License
 */
(() => {
    const panel = document.getElementById('docpanel');
    const body = document.getElementById('docpanel-body');
    const title = document.getElementById('docpanel-title');
    const close = document.getElementById('docpanel-close');
    const tabs = Array.from(document.querySelectorAll('.footer-docs [data-doc]'));

    if (!panel || !body || !title || tabs.length === 0) {
        return;
    }

    let current = null;
    let request = 0;

    const setSelected = function (key) {
        tabs.forEach((tab) => {
            const on = tab.dataset.doc === key;
            tab.setAttribute('aria-selected', on ? 'true' : 'false');
            tab.classList.toggle('is-active', on);
        });
    };

    const hide = function () {
        current = null;
        setSelected(null);
        panel.hidden = true;
        body.innerHTML = '';
    };

    const show = function (tab) {
        const key = tab.dataset.doc;
        const id = ++request;
        current = key;
        setSelected(key);
        panel.hidden = false;
        body.innerHTML = '<p class="docpanel-loading">' + (tab.dataset.loading || 'Loading…') + '</p>';

        fetch('docs.php?doc=' + encodeURIComponent(key), { headers: { Accept: 'application/json' } })
            .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
            .then((doc) => {
                if (id !== request || current !== key) {
                    return;
                }
                title.textContent = doc.title;
                body.innerHTML = doc.html;
                body.scrollTop = 0;
                panel.focus({ preventScroll: false });
            })
            .catch(() => {
                if (id !== request) {
                    return;
                }
                body.innerHTML = '<p class="docpanel-loading">' +
                    (title.dataset.error || 'Could not load the document.') + '</p>';
            });
    };

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            if (current === tab.dataset.doc) {
                hide();
                tab.focus();
                return;
            }
            show(tab);
        });
    });

    close.addEventListener('click', () => {
        const tab = tabs.find((candidate) => candidate.dataset.doc === current);
        hide();
        if (tab) {
            tab.focus();
        }
    });

    panel.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            close.click();
        }
    });

    // in-document anchors scroll inside the panel, not the page
    body.addEventListener('click', (event) => {
        const link = event.target.closest('a[href^="#doc-"]');
        if (!link) {
            return;
        }
        const target = body.querySelector(link.getAttribute('href'));
        if (target) {
            event.preventDefault();
            target.scrollIntoView({ block: 'start', behavior: 'smooth' });
        }
    });
})();
