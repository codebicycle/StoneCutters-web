'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('items/show');
var _ = require('underscore');

module.exports = Base.extend({
    tagName: 'main',
    id: 'items-show-view',
    className: 'items-show-view'
});
