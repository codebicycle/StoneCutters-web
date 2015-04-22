'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('header/index');
var Metric = require('../../../../../../modules/metric');

module.exports = Base.extend({
    tagName: 'header',
    id: 'header-view',
    className: 'header-view',
    events: {
        'click .posting': 'onPostClick',
        'click [data-increment-metric]': Metric.incrementEventHandler
    },
    postRender: function() {
        this.app.router.appView.on('posting:start', this.onPostingStart.bind(this));
        this.app.router.appView.on('posting:end', this.onPostingEnd.bind(this));
    },
    onPostClick: function() {
        var currentRoute = this.app.session.get('currentRoute');

        this.app.sixpack.convert(this.app.sixpack.experiments.dgdPostingBtn);

        if (currentRoute.controller === 'items' && currentRoute.action === 'show') {
            this.app.sixpack.convert(this.app.sixpack.experiments.desktopDGD23ShowSimplifiedReplyForm, 'publish');
        }
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
