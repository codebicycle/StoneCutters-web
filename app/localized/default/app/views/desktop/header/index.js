'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('header/index');
var Metric = require('../../../../../../modules/metric');

module.exports = Base.extend({
    tagName: 'header',
    id: 'header-view',
    className: 'header-view wrapper',
    events: {
        'click .posting': 'onPostClick',
        'click [data-increment-metric]': Metric.incrementEventHandler
    },
    wordingAlternatives: {
        'control': 'Publicá un aviso gratis',
        'control-a': 'Publicá un aviso gratis',
        'sell-your-item': 'Vendé tu artículo!',
        'sell-your-item-nc': 'Vendé tu artículo! (sin comisión)',
        'i-want-to-sell': 'Quiero vender!',
        'publish': 'Publicar',
        'sell': 'Vender'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var wordingButton;

        if (this.app.sixpack.experiments.growthPostingButtonWording){
            wordingButton = this.wordingAlternatives[this.app.sixpack.experiments.growthPostingButtonWording.alternative];
        }

        return _.extend({}, data, {
            wordingButton: wordingButton
        });
    },
    postRender: function() {
        this.app.router.appView.on('posting:start', this.onPostingStart.bind(this));
        this.app.router.appView.on('posting:end', this.onPostingEnd.bind(this));
        this.app.router.appView.on('header:hide', this.onHeaderHide.bind(this));
        this.app.router.appView.on('header:show', this.onHeaderShow.bind(this));
    },
    onPostClick: function() {
        var currentRoute = this.app.session.get('currentRoute');

        if (currentRoute.controller === 'items' && currentRoute.action === 'show') {
            this.app.sixpack.convert(this.app.sixpack.experiments.desktopDGD23ShowSimplifiedReplyForm, 'publish');
        }

        this.app.sixpack.convert(this.app.sixpack.experiments.growthPostingButtonWording);
    },
    onPostingStart: function() {
        this.toggleElements(false);
    },
    onPostingEnd: function() {
        this.toggleElements(true);
    },
    toggleElements: function(flag) {
        this.$el.find('.posting, .search-form').toggleClass('disabled', !flag);
        this.$el.find('.posting-title').toggleClass('disabled', flag);
    },
    onHeaderHide: function() {
        this.$el.hide();
    },
    onHeaderShow: function() {
        this.$el.show();
    }
});
