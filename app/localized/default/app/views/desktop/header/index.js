'use strict';

var Base = require('../../../../../common/app/bases/view');
var _ = require('underscore');

module.exports = Base.extend({
    tagName: 'header',
    id: 'header-view',
    className: 'header-view',
    postRender: function() {
    	this.app.router.appView.on('posting:start', this.onPostingStart.bind(this));
    },
    onPostingStart: function () {
    	console.log('posting header');
    }
});

module.exports.id = 'header/index';