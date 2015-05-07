'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('items/list');

module.exports = Base.extend({
    tagName: 'main',
    id: 'items-list-view',
    className: 'items-list-view'
});
