'use strict';

var helpers = require('../helpers');
var utils = require('../../shared/utils');

module.exports = function(params, next) {
    if (this.app.session.get('platform') === 'desktop' && params.from === 'schibsted') {
        console.log('hola');
        this.app.seo.addMetatag('canonical', helpers.common.fullizeUrl(utils.removeParams(this.app.session.get('url'), 'from'), this.app));
    }
    next();
};
