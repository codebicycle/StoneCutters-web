'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('header/index');
var Sixpack = require('../../../../../../../shared/sixpack');
var statsd = require('../../../../../../../shared/statsd')();

module.exports = Base.extend({
    tagName: 'header',
    id: 'header-view',
    className: 'header-view',
    events: {
        'click .posting': 'onPostClick',
        'click [data-dgd-track]': 'onClickDgdTrack'
    },
    postRender: function() {
        this.app.router.appView.on('posting:start', this.onPostingStart.bind(this));
        this.app.router.appView.on('posting:end', this.onPostingEnd.bind(this));
    },
    onPostClick: function() {
        var sixpack = new Sixpack({
            clientId: this.app.session.get('clientId'),
            ip: this.app.session.get('ip'),
            userAgent: this.app.session.get('userAgent'),
            platform: this.app.session.get('platform'),
            market: this.app.session.get('location').abbreviation
        });

        sixpack.convert(sixpack.experiments.desktopTest);
    },
    onPostingStart: function() {
        $('.posting, .search-form').addClass('disabled');
        $('.posting-title').removeClass('disabled');
    },
    onPostingEnd: function() {
        $('.posting, .search-form').removeClass('disabled');
        $('.posting-title').addClass('disabled');
    },
    onClickDgdTrack: function(event) {
        var $elem = $(event.currentTarget);
        var type = $elem.data('dgd-track');

        statsd.increment([this.app.session.get('location').abbreviation, 'dgd', 'home', type, this.app.session.get('platform')]);
    }
});
