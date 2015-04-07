'use strict';

module.exports = function convert(experiment, kpi, done) {
    if (typeof kpi === 'function') {
        done = kpi;
        kpi = null;
    }
    if (!experiment || !experiment.name) {
        return this.callback(done)();
    }
    $.ajax({
        url: '/tracking/sixpack.gif?experiment=' + experiment.key + '&platform=' + this.platform + '&market=' + this.market + (kpi ? '&kpi=' + kpi : ''),
        cache: false
    })
    .always(always.bind(this));

    function always() {
        this.callback(done)();
    }
};
