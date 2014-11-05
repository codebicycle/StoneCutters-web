'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('pages/about');
var _ = require('underscore');

module.exports = Base.extend({
    tagName: 'main',
    id: 'pages-about-view',
    className: 'page-standart'
});
