'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('items/unavailable');
var _ = require('underscore');
var asynquence = require('asynquence');

module.exports = Base.extend({
    tagName: 'aside',
    className: 'items_unavailable_view'
});

module.exports.id = 'items/unavailable';
