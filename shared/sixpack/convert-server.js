'use strict';

var utils = require('../utils');
var statsd = require('../statsd')();

module.exports = function convert(experiment, kpi, done) {
    if (typeof kpi === 'function') {
        done = kpi;
        kpi = null;
    }
    if (!experiment || !experiment.name) {
        return this.callback(done)();
    }
    this.session.convert(this.name(experiment), kpi, callback.bind(this));

    function callback(err, res) {
        if (err || res.status !== 'ok') {
            statsd.increment([this.market, 'sixpack', 'convert', experiment.name, 'error', err ? 'err' : res.status, this.platform]);
            return this.callback(done)();
        }
        statsd.increment([this.market, 'sixpack', 'convert', experiment.name, 'success', this.platform]);
        this.callback(done)();
    }
};
