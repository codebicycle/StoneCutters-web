'use strict';

module.exports = function convert(experiment, done) {
    if (!experiment || !experiment.name) {
        return this.callback(done)();
    }
    $.ajax({
        url: '/tracking/sixpack/participate.gif?experiment=' + experiment.key,
        cache: false
    })
    .always(always.bind(this));

    function always() {
        this.callback(done)();
    }
};