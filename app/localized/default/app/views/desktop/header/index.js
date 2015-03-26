'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('header/index');
var statsd = require('../../../../../../../shared/statsd')();

module.exports = Base.extend({
    tagName: 'header',
    id: 'header-view',
    className: 'header-view',
    events: {
        'click [data-dgd-track]': 'onClickDgdTrack'
    },
    postRender: function () {
        this.app.router.appView.on('posting:start', this.onPostingStart.bind(this));
        this.app.router.appView.on('posting:end', this.onPostingEnd.bind(this));
    },
    onPostingStart: function () {
        $('.posting, .search-form').addClass('disabled');
        $('.posting-title').removeClass('disabled');
    },
    onPostingEnd: function () {
        $('.posting, .search-form').removeClass('disabled');
        $('.posting-title').addClass('disabled');
    },
    onClickDgdTrack: function(event) {
        var $elem = $(event.currentTarget);
        var type = $elem.data('dgd-track');

        statsd.increment([this.app.session.get('location').abbreviation, 'dgd', 'home', type, this.app.session.get('platform')]);
    }
});
