'use strict';

var Base = require('../../bases/action');
var config = require('../../../../../shared/config');

var List = Base.extend({
    prepare: prepare
});

function prepare(done) {
    var location = this.app.session.get('location');
    var icons = config.get(['icons', this.app.session.get('platform')], []);

    this.app.seo.setContent(this.dependencies.categories.meta);
    done({
        icons: (~icons.indexOf(location.url)) ? location.url.split('.') : 'default'.split('.'),
        location: location
    });
}

module.exports = List;
