'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('header/usernav');
var _ = require('underscore');

module.exports = Base.extend({
	tagName: 'aside',
	id: 'user-nav-bar',
    className: 'header-usernav-view'
});
