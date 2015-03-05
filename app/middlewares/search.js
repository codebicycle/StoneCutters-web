'use strict';

var helpers = require('../helpers');

module.exports = function(params, next) {
    this.app.session.update({
        search: params.search || ''
    });
    next();
};
