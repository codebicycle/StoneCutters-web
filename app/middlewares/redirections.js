'use strict';

var helpers = require('../helpers');

module.exports = function(params, next) {
    var path = this.app.session.get('path');

    if (path.length <= 1 || path.slice(-1) !== '/') {
        return next();
    }
    next.abort();
    return helpers.common.redirect.call(this, path.slice(0, -1));
};
