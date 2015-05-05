'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('home/index');

module.exports = Base.extend({
    tagName: 'main',
    id: 'home_view',
    className: 'home_view'
});
