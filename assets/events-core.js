/*
 * TrustFabric Events: shared logic for /events and /events/<slug>.
 * Reads window.TF_EVENTS (assets/events-data.js). No libraries.
 *
 *   TFEvents.events          published events, in data order
 *   TFEvents.statusOf(e,now) 'upcoming' | 'past' | 'tbc' (no confirmed date)
 *   TFEvents.banner(e)       the event's real photograph with its caption, or '' when there is none
 *   TFEvents.logo(e)         the event's official logo, or '' when there is none
 *   TFEvents.yearOf(e)       the year an event is filed under
 *   TFEvents.openConnect(s)  opens the "Connect with our team" form (optionally for one event slug)
 *   TFEvents.openLightbox(items, index)
 *   TFEvents.observe(root)   scroll reveals for newly rendered markup
 */
(function () {
    'use strict';

    var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var PART = { participating: 'is participating', attending: 'is attending', exhibiting: 'is exhibiting', speaking: 'is speaking' };

    function esc(s) {
        return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    var events = (window.TF_EVENTS || []).filter(function (e) { return e && e.slug && e.published !== false; });

    function parseDate(s) {
        if (!s) return null;
        var d = new Date(s + 'T00:00:00');
        return isNaN(d.getTime()) ? null : d;
    }

    // upcoming: ends today or later. past: ended before today. tbc: no valid start date yet.
    function statusOf(e, now) {
        var start = parseDate(e.startDate);
        if (!start) return 'tbc';
        var end = parseDate(e.endDate) || start;
        var today = new Date((now || new Date()).getTime());
        today.setHours(0, 0, 0, 0);
        return end.getTime() < today.getTime() ? 'past' : 'upcoming';
    }

    function statusLabel(st) { return st === 'upcoming' ? 'Upcoming' : st === 'past' ? 'Past event' : 'Details coming soon'; }

    function fullName(e) { return e.name + ' ' + e.year; }

    function place(e) { return [e.location, e.country].filter(Boolean).join(', '); }

    function partLabel(e) { return 'TrustFabric ' + (PART[e.participation] || PART.participating); }

    function fmtRange(e) {
        var s = parseDate(e.startDate), f = parseDate(e.endDate);
        if (!s) return '';
        if (!f || f.getTime() === s.getTime()) return s.getDate() + ' ' + MONTHS[s.getMonth()] + ' ' + s.getFullYear();
        if (s.getMonth() === f.getMonth() && s.getFullYear() === f.getFullYear()) return s.getDate() + ' to ' + f.getDate() + ' ' + MONTHS[f.getMonth()] + ' ' + f.getFullYear();
        return s.getDate() + ' ' + MONTHS[s.getMonth()] + (s.getFullYear() !== f.getFullYear() ? ' ' + s.getFullYear() : '') + ' to ' + f.getDate() + ' ' + MONTHS[f.getMonth()] + ' ' + f.getFullYear();
    }

    var SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    // Compact date for the events table: { top: '17 to 19', bottom: 'Nov 2026' }. Undated events say so.
    function dateChip(e) {
        var s = parseDate(e.startDate), f = parseDate(e.endDate);
        if (!s) return { top: 'TBC', bottom: 'Dates soon' };
        if (!f || f.getTime() === s.getTime()) return { top: String(s.getDate()), bottom: SHORT[s.getMonth()] + ' ' + s.getFullYear() };
        if (s.getMonth() === f.getMonth() && s.getFullYear() === f.getFullYear()) return { top: s.getDate() + ' to ' + f.getDate(), bottom: SHORT[s.getMonth()] + ' ' + s.getFullYear() };
        if (s.getFullYear() === f.getFullYear()) return { top: s.getDate() + ' ' + SHORT[s.getMonth()] + ' to ' + f.getDate() + ' ' + SHORT[f.getMonth()], bottom: String(s.getFullYear()) };
        return { top: s.getDate() + ' ' + SHORT[s.getMonth()] + ' ' + s.getFullYear(), bottom: 'to ' + f.getDate() + ' ' + SHORT[f.getMonth()] + ' ' + f.getFullYear() };
    }

    function url(e) { return '/events/' + encodeURIComponent(e.slug); }

    // The year an event is filed under: its start date when confirmed, otherwise the year in the data.
    function yearOf(e) {
        var d = parseDate(e.startDate);
        return d ? d.getFullYear() : (Number(e.year) || 0);
    }

    // Real imagery only. If an event has no photograph or logo, nothing is drawn in its place.
    function banner(e) {
        if (!e.banner) return '';
        return '<figure class="photo"><img src="' + esc(e.banner) + '" alt="' + esc(e.bannerAlt || '') + '" loading="lazy" decoding="async">' +
            (e.bannerCaption ? '<figcaption>' + esc(e.bannerCaption) + '</figcaption>' : '') + '</figure>';
    }
    function logo(e) {
        if (!e.logo) return '';
        return '<img class="ev-logo" src="' + esc(e.logo) + '" alt="' + esc(e.logoAlt || (e.name + ' logo')) + '" loading="lazy" decoding="async">';
    }

    /* ---------- scroll reveals ---------- */
    var io = null;
    function observe(root) {
        var els = (root || document).querySelectorAll('.reveal:not(.in)');
        if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('in'); }); return; }
        if (!io) {
            io = new IntersectionObserver(function (entries) {
                entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
            }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
        }
        els.forEach(function (el) { io.observe(el); });
    }

    /* ---------- navbar (mobile menu) ---------- */
    function initNav() {
        var burger = document.getElementById('burger');
        var menu = document.getElementById('mobileMenu');
        if (!burger || !menu) return;
        function setMenu(open) {
            burger.setAttribute('aria-expanded', open ? 'true' : 'false');
            burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
            menu.classList.toggle('open', open);
            menu.hidden = !open;
            document.body.style.overflow = open ? 'hidden' : '';
        }
        burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
        menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); burger.focus(); } });
        window.addEventListener('resize', function () { if (window.innerWidth > 900 && menu.classList.contains('open')) setMenu(false); });
    }

    /* ---------- "Connect with our team" dialog ---------- */
    var connectDlg = null;
    function buildConnect() {
        var opts = '<option value="">General enquiry</option>' + events.map(function (e) {
            return '<option value="' + esc(e.slug) + '">' + esc(fullName(e)) + '</option>';
        }).join('');
        var dlg = document.createElement('dialog');
        dlg.className = 'connect';
        dlg.setAttribute('aria-labelledby', 'cn-title');
        dlg.innerHTML =
            '<div class="connect-in">' +
            '<button class="x" type="button" aria-label="Close"></button>' +
            '<div id="cn-form-wrap">' +
            '<h2 id="cn-title">Connect with our team</h2>' +
            '<p class="sub">Tell us a little about you and the event, and we will get back to you.</p>' +
            '<form id="cn-form" novalidate>' +
            '<div class="cf-row">' +
            '<div class="cf-field"><label for="cn-name">Full name</label><input id="cn-name" class="cf-input" type="text" autocomplete="name" required aria-describedby="cn-name-e"><p class="cf-err" id="cn-name-e">Please enter your name.</p></div>' +
            '<div class="cf-field"><label for="cn-email">Work email</label><input id="cn-email" class="cf-input" type="email" autocomplete="email" required aria-describedby="cn-email-e"><p class="cf-err" id="cn-email-e">Please enter a valid email address.</p></div>' +
            '</div>' +
            '<div class="cf-row">' +
            '<div class="cf-field"><label for="cn-company">Company <span class="opt">(optional)</span></label><input id="cn-company" class="cf-input" type="text" autocomplete="organization"></div>' +
            '<div class="cf-field"><label for="cn-event">Event</label><select id="cn-event" class="cf-input">' + opts + '</select></div>' +
            '</div>' +
            '<div class="cf-field"><label for="cn-msg">Message <span class="opt">(optional)</span></label><textarea id="cn-msg" class="cf-input" maxlength="1500"></textarea></div>' +
            '<label class="cf-consent"><input id="cn-consent" type="checkbox" required aria-describedby="cn-consent-e"><span>I agree to TrustFabric using these details to respond to me, as described in the <a href="/privacy-policy.html" target="_blank" rel="noopener">Privacy Policy</a>.</span></label>' +
            '<p class="cf-err" id="cn-consent-e" style="margin-left:29px">Please accept to continue.</p>' +
            '<button class="btn btn-red" type="submit" id="cn-submit">Send message</button>' +
            '<p class="cf-fail" id="cn-fail" role="alert">Something went wrong. Please try again, or email us at <a href="mailto:info@trustfabric.in">info@trustfabric.in</a>.</p>' +
            '</form></div>' +
            '<div class="cf-done" id="cn-done" tabindex="-1">' +
            '<div class="cf-tick"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg></div>' +
            '<h2>Thank you.</h2><p class="sub">We have your message and will get back to you at <strong id="cn-done-mail"></strong>.</p>' +
            '<button class="btn btn-dark" type="button" id="cn-done-close">Close</button>' +
            '</div></div>';
        document.body.appendChild(dlg);

        function $(id) { return dlg.querySelector('#' + id); }
        function mark(k, bad) {
            var el = $('cn-' + k); var er = $('cn-' + k + '-e');
            if (el && el.type !== 'checkbox') el.setAttribute('aria-invalid', bad ? 'true' : 'false');
            if (er) er.classList.toggle('show', bad);
        }
        function closeIt() { dlg.close(); }
        dlg.querySelector('.x').addEventListener('click', closeIt);
        $('cn-done-close').addEventListener('click', closeIt);
        dlg.addEventListener('click', function (e) { if (e.target === dlg) closeIt(); });
        dlg.addEventListener('close', function () { document.body.style.overflow = ''; });
        ['name', 'email'].forEach(function (k) { $('cn-' + k).addEventListener('input', function () { mark(k, false); }); });
        $('cn-consent').addEventListener('change', function () { mark('consent', false); });

        $('cn-form').addEventListener('submit', function (ev) {
            ev.preventDefault();
            $('cn-fail').classList.remove('show');
            var d = {
                name: $('cn-name').value.trim(),
                email: $('cn-email').value.trim(),
                company: $('cn-company').value.trim(),
                event: $('cn-event').value,
                message: $('cn-msg').value.trim(),
                consentData: $('cn-consent').checked
            };
            var ok = { name: !!d.name, email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email), consent: d.consentData };
            var first = null;
            Object.keys(ok).forEach(function (k) { mark(k, !ok[k]); if (!ok[k] && !first) first = k; });
            if (first) { $('cn-' + first).focus(); return; }
            var ev0 = events.filter(function (e) { return e.slug === d.event; })[0];
            d.eventName = ev0 ? fullName(ev0) : '';
            var btn = $('cn-submit'); btn.disabled = true; btn.textContent = 'Sending...';
            fetch('/api/event-connect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) })
                .then(function (r) { if (!r.ok) throw new Error('bad status'); return r; })
                .then(function () {
                    $('cn-form-wrap').style.display = 'none';
                    $('cn-done-mail').textContent = d.email;
                    var done = $('cn-done'); done.classList.add('show'); done.focus();
                })
                .catch(function () { $('cn-fail').classList.add('show'); btn.disabled = false; btn.textContent = 'Send message'; });
        });
        return dlg;
    }

    function openConnect(slug) {
        if (!connectDlg) connectDlg = buildConnect();
        var sel = connectDlg.querySelector('#cn-event');
        sel.value = slug && events.some(function (e) { return e.slug === slug; }) ? slug : '';
        // reset to the form view if it was submitted earlier
        connectDlg.querySelector('#cn-form-wrap').style.display = '';
        connectDlg.querySelector('#cn-done').classList.remove('show');
        var b = connectDlg.querySelector('#cn-submit'); b.disabled = false; b.textContent = 'Send message';
        document.body.style.overflow = 'hidden';
        connectDlg.showModal();
        connectDlg.querySelector('#cn-name').focus();
    }

    /* ---------- lightbox ---------- */
    var lb = null, lbItems = [], lbIndex = 0;
    function lbShow() {
        var it = lbItems[lbIndex]; if (!it) return;
        lb.querySelector('img').src = it.src;
        lb.querySelector('img').alt = it.alt || '';
        lb.querySelector('figcaption').textContent = it.caption || it.alt || '';
        var many = lbItems.length > 1;
        lb.querySelector('.lb-prev').hidden = !many; lb.querySelector('.lb-next').hidden = !many;
    }
    function lbStep(n) { lbIndex = (lbIndex + n + lbItems.length) % lbItems.length; lbShow(); }
    function openLightbox(items, index) {
        if (!items || !items.length) return;
        if (!lb) {
            lb = document.createElement('dialog');
            lb.className = 'lightbox';
            lb.setAttribute('aria-label', 'Photo viewer');
            lb.innerHTML = '<figure class="lb-fig"><img alt=""><figcaption></figcaption></figure>' +
                '<button class="lb-btn lb-close" type="button" aria-label="Close"><span></span></button>' +
                '<button class="lb-btn lb-prev" type="button" aria-label="Previous photo"><span></span></button>' +
                '<button class="lb-btn lb-next" type="button" aria-label="Next photo"><span></span></button>';
            document.body.appendChild(lb);
            lb.querySelector('.lb-close').addEventListener('click', function () { lb.close(); });
            lb.querySelector('.lb-prev').addEventListener('click', function () { lbStep(-1); });
            lb.querySelector('.lb-next').addEventListener('click', function () { lbStep(1); });
            lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
            lb.addEventListener('keydown', function (e) {
                if (e.key === 'ArrowLeft' && lbItems.length > 1) lbStep(-1);
                if (e.key === 'ArrowRight' && lbItems.length > 1) lbStep(1);
            });
            lb.addEventListener('close', function () { document.body.style.overflow = ''; });
        }
        lbItems = items; lbIndex = Math.max(0, Math.min(index || 0, items.length - 1));
        lbShow();
        document.body.style.overflow = 'hidden';
        lb.showModal();
        lb.querySelector('.lb-close').focus();
    }

    /* ---------- wire up ---------- */
    document.addEventListener('click', function (e) {
        var t = e.target.closest ? e.target.closest('[data-connect]') : null;
        if (t) { e.preventDefault(); openConnect(t.getAttribute('data-event') || ''); }
    });
    document.addEventListener('DOMContentLoaded', function () { initNav(); observe(document); });

    window.TFEvents = {
        events: events, esc: esc, statusOf: statusOf, statusLabel: statusLabel, fullName: fullName, place: place,
        partLabel: partLabel, fmtRange: fmtRange, dateChip: dateChip, url: url, banner: banner, logo: logo, yearOf: yearOf, observe: observe,
        openConnect: openConnect, openLightbox: openLightbox
    };
})();
