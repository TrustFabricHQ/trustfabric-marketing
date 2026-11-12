// Single source of truth for the DPDP certification course.
// Edit values here; dpdp-course.html and dpdp-course/enroll.html read them on load.
window.COURSE = {
    COURSE_NAME: 'TrustFabric Certified DPDP Professional (CDPP)',
    BATCH_NO: 1,
    DAY1_DATE: 'TBD',   // e.g. '2026-12-13'
    DAY2_DATE: 'TBD',   // e.g. '2026-12-14'
    PRICE_INR: 14999,   // base price, before GST
    GST_PERCENT: 18,
    SEATS: 30,
    CONTACT_EMAIL: 'info@trustfabric.in'
};

(function (c) {
    function inr(n) { return '₹' + Math.round(n).toLocaleString('en-IN'); }
    function fmtDate(d) {
        if (!d || d === 'TBD') return null;
        var dt = new Date(d + 'T00:00:00');
        if (isNaN(dt)) return null;
        return dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
    }
    var gst = c.PRICE_INR * c.GST_PERCENT / 100;
    var d1 = fmtDate(c.DAY1_DATE), d2 = fmtDate(c.DAY2_DATE);
    var values = {
        'course-name': c.COURSE_NAME,
        'batch-no': 'Batch ' + c.BATCH_NO,
        'price': inr(c.PRICE_INR),
        'price-gst': inr(c.PRICE_INR) + ' + GST',
        'gst-amount': inr(gst) + ' (' + c.GST_PERCENT + '%)',
        'price-total': inr(c.PRICE_INR + gst),
        'seats': c.SEATS + ' seats',
        'day1': d1 || 'Dates announced soon',
        'day2': d2 || 'Dates announced soon',
        'dates': d1 && d2 ? d1 + ' and ' + d2 : 'Dates announced soon',
        'contact-email': c.CONTACT_EMAIL
    };
    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('[data-course]').forEach(function (el) {
            var v = values[el.getAttribute('data-course')];
            if (v == null) return;
            el.textContent = v;
            if (el.tagName === 'A' && el.getAttribute('data-course') === 'contact-email') {
                el.href = 'mailto:' + v;
            }
        });
    });
})(window.COURSE);
