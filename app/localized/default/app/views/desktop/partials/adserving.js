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

        this._checkCsaLib();
        //this._checkAdxLib();

        console.log(settings.params);

        window._googCsa('ads', settings.options, settings.params);

    },
    getAdserving: function(){
        var currentCategory = 185; // csa
        var settings = AdServing.getSettings.call(this, currentCategory);

        return settings;
    },
    _checkCsaLib: function() {
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
    }/*,
    _checkAdxLib: function() {
        var id = 'gadx-lib';
        var $adx;

        if (!$('#' + id).length) {
            $adx = $('<script></script>');
            $adx.attr({
                async: true,
                type: 'text/javascript',
                src: '//pagead2.googlesyndication.com/pagead/show_ads.js',
                id: id
            });
            $adx.appendTo('head');
        }
    }*/
});

module.exports.id = 'partials/adserving';
