'use strict';

module.exports = function convert(experiment, done) {
    if (!experiment || !experiment.alternative) {
        return this.callback(done)();
    }
    $.ajax({
        url: '/tracking/sixpack.gif?experiment=' + experiment.key + '&platform=' + this.platform,
        cache: false
    })
    .always(always);

    function always() {
        this.callback(done)();
    }
};
