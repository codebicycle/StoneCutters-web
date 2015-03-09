'use strict';

module.exports = function(params, next) {
    this.app.session.update({
        search: params.search || ''
    });
    next();
};
