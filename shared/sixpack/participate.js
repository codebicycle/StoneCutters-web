'use strict';

var _ = require('underscore');
var statsd = require('../statsd')();

module.exports = function participate(experiment, done) {
    if (!experiment || !experiment.name) {
        return this.callback(done)();
    }
    $.ajax({
        url: '/tracking/sixpack/participate?experiment=' + experiment.key + '&platform=' + this.platform + '&market=' + this.market,
        cache: false,
        timeout: 1000,
        context: this
    })
    .done(function(data){
        if (!_.isEmpty(data)) {
            this.experiments[experiment.key] = data;
        }
        else {
            delete this.experiments[experiment.key];
        }
    })
    .fail(function(){
        statsd.increment([this.market, 'sixpack', 'participate', experiment.name, 'timeout', this.platform]);
    })
    .always(always.bind(this));

    function always() {
        this.callback(done)();
    }
};
