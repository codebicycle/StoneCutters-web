'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('header/index');
var _ = require('underscore');

module.exports = Base.extend({
    tagName: 'header',
    id: 'header-view',
    className: 'header-view',
    postRender: function () {
    	this.app.router.appView.on('posting:start', this.onPostingStart.bind(this));
    },
    onPostingStart: function () {
		$('.posting, .search-form').addClass('disabled');
		$('.posting-title').removeClass('disabled');
    }
});