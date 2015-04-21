'use strict';

var _ = require('underscore');
var statsd = require('../statsd')();

module.exports = function participate(experiment, done) {
    var fraction = experiment.fraction !== undefined ? experiment.fraction : 1;

    if (!experiment || !experiment.name) {
        return this.callback(done)();
    }
    if (!experiment.force) {
        this.session.participate(this.name(experiment), _.values(experiment.alternatives), fraction, callback.bind(this));
    }
    else {
        this.session.participate(this.name(experiment), _.values(experiment.alternatives), fraction, experiment.force, callback.bind(this));
    }

    function callback(err, res) {
        if (err || res.status !== 'ok') {
            statsd.increment([this.market, 'sixpack', 'participate', experiment.name, 'error', err ? 'err' : res.status, this.platform]);
            delete this.experiments[experiment.key];
            return this.callback(done)();
        }
        statsd.increment([this.market, 'sixpack', 'participate', experiment.name, 'success', this.platform]);
        delete this.experiments[experiment.key].alternatives;
        this.experiments[experiment.key].alternative = res.alternative.name;
        this.callback(done)();
    }
};
