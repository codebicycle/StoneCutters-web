'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('header/index');
var Metric = require('../../../../../../modules/metric');
var Sixpack = require('../../../../../../../shared/sixpack');

module.exports = Base.extend({
    tagName: 'header',
    id: 'header-view',
    className: 'header-view',
    events: {
        'click .posting': 'onPostClick',
        'click .brand': 'onLogoClick',
        'blur .search-form': 'onSearchBlur',
        'click [data-increment]': Metric.incrementEventHandler
    },
    postRender: function() {
        this.app.router.appView.on('posting:start', this.onPostingStart.bind(this));
        this.app.router.appView.on('posting:end', this.onPostingEnd.bind(this));
    },
    onPostClick: function() {
        var currentRoute = this.app.session.get('currentRoute');
        
        var sixpack = new Sixpack({
            clientId: this.app.session.get('clientId'),
            ip: this.app.session.get('ip'),
            userAgent: this.app.session.get('userAgent'),
            platform: this.app.session.get('platform'),
            market: this.app.session.get('location').abbreviation
        });

        sixpack.convert(sixpack.experiments.desktopTest);
        sixpack.convert(sixpack.experiments.fractionKPIsTest);
        
        if (currentRoute.controller === 'items' && currentRoute.action === 'show') {
            sixpack.convert(sixpack.experiments.desktopDGD23ShowSimplifiedReplyForm, 'publish');
        }
    },
    onLogoClick: function() {
        var sixpack = new Sixpack({
            clientId: this.app.session.get('clientId'),
            ip: this.app.session.get('ip'),
            userAgent: this.app.session.get('userAgent'),
            platform: this.app.session.get('platform'),
            market: this.app.session.get('location').abbreviation
        });

        sixpack.convert(sixpack.experiments.fractionKPIsTest, 'logo');
    },
    onSearchBlur: function() {
        var sixpack = new Sixpack({
            clientId: this.app.session.get('clientId'),
            ip: this.app.session.get('ip'),
            userAgent: this.app.session.get('userAgent'),
            platform: this.app.session.get('platform'),
            market: this.app.session.get('location').abbreviation
        });

        sixpack.convert(sixpack.experiments.fractionKPIsTest, 'search');
    },
    onPostingStart: function() {
        $('.posting, .search-form').addClass('disabled');
        $('.posting-title').removeClass('disabled');
    },
    onPostingEnd: function() {
        $('.posting, .search-form').removeClass('disabled');
        $('.posting-title').addClass('disabled');
    }
});
