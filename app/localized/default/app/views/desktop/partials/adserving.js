'use strict';

var Base = require('../../../../../common/app/bases/view');
var _ = require('underscore');
var AdServing = require('../../../../../../modules/adserving');

module.exports = Base.extend({
    className: 'adserving-listing',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        this._checkAdServing();
        return _.extend({}, data, {
            adserving: {
                enabled : this.adServing.isSlotEnabled(),
                slotname: this.adServing.get('slotname'),
                classname: 'ads-' + this.adServing.get('type').toLowerCase()
            }
        });
    },
    postRender: function() {
        this._checkAdServing();
        if (!this.adServing.isSlotEnabled()) {
            return;
        }
        var settings = this.adServing.getSettings();
        var type = this.adServing.get('type');

        if (type == 'CSA') {
            if(this.isGoogleReferer() && (settings.ifSeo && settings.ifSeo > 0)){
                settings.params = _.extend({}, settings.params, {
                    number: settings.ifSeo
                });
            }
            this._includeCsaLib();
            window._googCsa('ads', settings.options, settings.params);
        }
    },
    _includeCsaLib: function() {
        var id = 'gads-lib';
        var $ads;

        if (!$('#' + id).length) {
            window._googCsa = window._googCsa || function() {
                (window._googCsa.q = window._googCsa.q || []).push(arguments);
            };
            window._googCsa.t = 1 * new Date();
            $ads = $('<script></script>');
            $ads.attr({
                async: true,
                type: 'text/javascript',
                src: '//www.google.com/adsense/search/async-ads.js',
                id: id
            });
            $ads.appendTo('head');
        }
    },
    _checkAdServing: function() {
        if (!this.adServing) {
            this.adServing = new AdServing({
                slotname: this.options.subId || this.options.subid
            }, {
                app: this.app,
                categories: this.options.categories
            });
        }
    },
    isGoogleReferer: function(){
        return document.referrer.match(/^[a-zA-Z0-9:\/\/]*\.google\.[a-zA-Z.]+/) && (document.location.search.indexOf("invite=") == -1);
    }
});

module.exports.id = 'partials/adserving';
