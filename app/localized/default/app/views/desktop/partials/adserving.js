'use strict';

var Base = require('../../../../../common/app/bases/view');
var _ = require('underscore');
var AdServing = require('../../../../../../modules/adserving');

module.exports = Base.extend({
    className: 'adserving-listing',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var slotname = this.options.subId;
        var settingsAdserving = this.getAdserving();
        var enabledAD = settingsAdserving.enabled; // TODO

        return _.extend({}, data, {
            adserving: {
                enabled : enabledAD,
                slotname: slotname
            }
        });
    },
    postRender: function(){
        var slotname = this.options.pubId;
        var settings = this.getAdserving();

        this._checkAdsenseLib();

        window._googCsa('ads', settings.options, settings.params);

        console.log('loro');

        /*if (settings.type === 'CSA') {
        }*/
        /*else if(settings.type === 'ADX') {
            var $gadx;
            window.google_ad_client = "ca-pub-9177434926134739";
            window.google_ad_slot = "4197936346";
            window.google_ad_width = 500;
            window.google_ad_height = 600;

            $gadx = $('<script></script>');
            $gadx.attr({
                type: 'text/javascript',
                src: '//pagead2.googlesyndication.com/pagead/show_ads.js'
            });
            $gadx.appendTo('#' + slotname);
        }*/
    },
    getAdserving: function(){
        //var currentCategory = 410; // adx
        var currentCategory = 185; // csa
        var settings = AdServing.getSettings.call(this, currentCategory);

        return settings;
    },
    _checkAdsenseLib: function() {
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
    }
});

module.exports.id = 'partials/adserving';
