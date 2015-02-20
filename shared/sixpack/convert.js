'use strict';

module.exports = function convert(experiment, done) {
    if (!experiment || !experiment.name) {
        return this.callback(done)();
    }
    $.ajax({
        url: '/tracking/sixpack.gif?experiment=' + experiment.key + '&platform=' + this.platform + '&market=' + this.market,
        cache: false
    })
    .always(always);

    function always() {
        this.callback(done)();
    }
};
