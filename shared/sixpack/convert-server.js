'use strict';

var utils = require('../utils');

module.exports = function convert(experiment, done) {
    this.session.convert(this.name(experiment), this.callback(done));
};
