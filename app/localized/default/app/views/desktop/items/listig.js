'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('items/listig');

module.exports = Base.extend({
    tagName: 'main',
    id: 'items-listig-view',
    className: 'items-listig-view'
});
