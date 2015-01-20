'use strict';

var sixpack = require('sixpack-client');
var asynquence = require('asynquence');
var _ = require('underscore');
var utils = require('../utils');
var config = require('../config').get('sixpack', {
    experiments: {}
});

module.exports = Sixpack;

function Sixpack(options) {
    this.clientId = options.clientId;
    this.ip = options.ip;
    this.userAgent = options.userAgent;
    this.platform = options.platform;
    this.experiments = options.experiments || this.experiments();
    this.session = new sixpack.Session(this.clientId, config.host, this.ip, this.userAgent, config.timeout);
}

Sixpack.prototype.enabled = Sixpack.enabled = config.enabled;

Sixpack.prototype.experiments = function() {
    var experiments = {};

    _.each(Object.keys(config.experiments), function each(key) {
        var experiment = _.clone(config.experiments[key]);

        if (this.enabled && experiment.enabled && _.contains(experiment.platforms, this.platform)) {
            delete experiment.enabled;
            delete experiment.platforms;
            experiment.key = key;
            experiments[key] = experiment;
        }
    }, this);
    return experiments;
};

Sixpack.prototype.participateAll = function(done) {
    asynquence().or(this.fail(done))
        .gate.apply(null, _.map(_.values(this.experiments), this.participateOne, this))
        .val(this.callback(done));
};

Sixpack.prototype.participateOne = function(experiment) {
    return this.participate.bind(this, experiment);
};

Sixpack.prototype.participate = function(experiment, done) {
    if (!experiment.force) {
        this.session.participate(this.name(experiment), _.values(experiment.alternatives), callback.bind(this));
    }
    else {
        this.session.participate(this.name(experiment), _.values(experiment.alternatives), experiment.force, callback.bind(this));
    }

    function callback(err, res) {
        if (err || res.status !== 'ok') {
            delete this.experiments[experiment.key];
            return this.callback(done)();
        }
        delete this.experiments[experiment.key].alternatives;
        this.experiments[experiment.key].alternative = res.alternative.name;
        this.callback(done)();
    }
};

Sixpack.prototype.convert = utils.isServer ? require('./convert' + '-server') : require('./convert');

Sixpack.prototype.className = function(experiment) {
    if (!experiment || !experiment.alternative) {
        return '';
    }
    return 'experiment-' + experiment.name + ' alternative-' + experiment.alternative;
};

Sixpack.prototype.name = function(experiment) {
    return this.platform + '-' + experiment.name;
};

Sixpack.prototype.callback = function(done) {
    return (done || utils.noop).errfcb || done || utils.noop;
};

Sixpack.prototype.fail = function(done) {
    return (done || utils.noop).fail || done || utils.noop;
};
