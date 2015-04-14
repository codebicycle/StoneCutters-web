'use strict';

var Sixpack = require('../../shared/sixpack');

module.exports = function(params, next) {
    this.app.sixpack = new Sixpack({
        clientId: this.app.session.get('clientId'),
        ip: this.app.session.get('ip'),
        userAgent: this.app.session.get('userAgent'),
        platform: this.app.session.get('platform'),
        market: this.app.session.get('location').abbreviation,
        experiments: this.app.session.get('experiments')
    });
    next();
};
