'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('partials/tracking');

module.exports = Base.extend({
    tagName: 'tr',
    attributes: _.extend(Base.prototype.attributes || {}, {style: 'display: none;'})
});
