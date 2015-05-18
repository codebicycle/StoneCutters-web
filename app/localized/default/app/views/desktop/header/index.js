'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('header/index');
var Metric = require('../../../../../../modules/metric');
var Mixpanel = require('../../../../../../modules/tracking/trackers/mixpanel');

module.exports = Base.extend({
    tagName: 'header',
    id: 'header-view',
    className: function() {
        var classes = ['header-view', 'wrapper'];
        var currentRoute = this.app.session.get('currentRoute');

        return classes.join(' ');
    },
    initialize: function() {
        Base.prototype.initialize.call(this);
        this._name = this.name;
        this._className = this.className();
        this.app.on('header:hide', this.onHide, this);
        this.app.on('header:show', this.onShow, this);
        this.app.on('header:customize', this.onCustomize, this);
        this.app.on('header:restore', this.onRestore, this);
    },
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
    },
    onPostClick: function() {
        var currentRoute = this.app.session.get('currentRoute');

        if (currentRoute.controller === 'items' && currentRoute.action === 'show') {
            this.app.sixpack.convert(this.app.sixpack.experiments.desktopDGD23ShowSimplifiedReplyForm, 'publish');
        }

        this.app.sixpack.convert(this.app.sixpack.experiments.growthPostingButtonWording);

        Mixpanel.track.call(this, 'postStarted');
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
    onHide: function() {
        this.$el.addClass('hidden');
    },
    onShow: function() {
        this.$el.removeClass('hidden');
    },
    onCustomize: function(opts) {
        if (opts.className) {
            this.changeClassName(opts.className);
        }
        if (opts.template) {
            this.changeTemplate(opts.template);
        }
        if (opts.search === false) {
            this.disableSearch();
        }
    },
    onRestore: function() {
        this.restoreClassName();
        this.restoreTemplate();
        this.enableSearch();
    },
    changeClassName: function(newClassName) {
        this.className = newClassName;
        this.$el.attr('class', newClassName);
    },
    restoreClassName: function() {
        this.className = this._className;
        this.$el.attr('class', this.className);
    },
    changeTemplate: function(newTemplate) {
        this.name = newTemplate;
        this.render();
    },
    restoreTemplate: function() {
        this.name = this._name;
        this.render();
    },
    disableSearch: function() {
        this.$el.find('.partials_search_view').hide();
    },
    enableSearch: function() {
        this.$el.find('.partials_search_view').show();
    }
});
