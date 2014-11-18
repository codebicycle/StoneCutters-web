'use strict';

var Base = require('../bases/collection');
var Language = require('../models/language');

module.exports = Base.extend({
    model: Language,
    url: '/countries/:location/languages',
    getDefault: function() {
        return this.first().get('locale');
    }
});

module.exports.id = 'Languages';
module.exports.cache = true;
