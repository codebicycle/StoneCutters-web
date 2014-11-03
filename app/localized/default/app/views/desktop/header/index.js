'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('header/index');
var _ = require('underscore');

module.exports = Base.extend({
    tagName: 'header',
    id: 'header-view',
    className: 'header-view',
    postRender: function () {
        this.app.router.appView.on('posting:start', this.onPostingStart.bind(this));
        this.app.router.appView.on('posting:end', this.onPostingEnd.bind(this));
        this.app.router.appView.on('home:start', this.onHomeStart.bind(this));
        this.app.router.appView.on('home:end', this.onHomeEnd.bind(this));
    },
    onPostingStart: function () {
        $('.posting, .search-form').addClass('disabled');
        $('.posting-title').removeClass('disabled');
    },
    onPostingEnd: function () {
        $('.posting, .search-form').removeClass('disabled');
        $('.posting-title').addClass('disabled');
    },
    onHomeStart: function () {
        $('.footer-options .categories').addClass('hide');
    },
    onHomeEnd: function () {
        $('.footer-options .categories').removeClass('hide');
    }
});
