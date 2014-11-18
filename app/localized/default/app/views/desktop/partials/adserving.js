'use strict';

var Base = require('../../../../../common/app/bases/view');
var _ = require('underscore');
var AdServing = require('../../../../../../modules/adserving');

module.exports = Base.extend({
    className: 'adserving-listing',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var slotname = this.options.subId;
        var settingsAdserving = this.getAdserving(slotname);
        var enabledAD = settingsAdserving.enabled;

        return _.extend({}, data, {
            adserving: {
                enabled : enabledAD,
                slotname: slotname
            }
        });
    },
    postRender: function(){
        var slotname = this.options.subid;
        var settings = this.getAdserving(slotname);
        var $gadxParams;
        var $gadx;
        var str;

        if (settings.type === 'CSA') {
            this._checkLib(function() {
                console.log(window._googCsa);
                window._googCsa('ads', settings.options, settings.params);
            });
        }/*
        else if(settings.type === 'ADX') {
            str = 'window.google_ad_client = "ca-pub-9177434926134739";';
            str += 'window.google_ad_slot = "4197936346";';
            str += 'window.google_ad_width = 500;';
            str += 'window.google_ad_height = 600;';

            $gadxParams = $('<script></script>');
            $gadxParams.text(str);


            $gadx = $('<script></script>');
            $gadx.attr({
                type: 'text/javascript',
                src: '//pagead2.googlesyndication.com/pagead/show_ads.js',
                id: slotname + '_script_adx'
            });

            $('#' + slotname).append($gadxParams, $gadx);
        }*/
        console.log('GATaSO', window.miraloqueteago);
    },
    getAdserving: function(slotname){
        var currentCategory = 362;
        var settings = AdServing.getSettings(slotname, currentCategory);

        return settings;
    },
    _checkLib: function(callback) {
        var id = 'ads-lib';
        var $ads;

        if (!$('#' + id).length) {
            return (function(G,o,O,g,L,e) {
                G[g]=G[g] || function() {
                  (G[g].q=G[g].q || []).push(arguments);
                },
                G[g].t = 1*new Date;
                /*L = o.createElement(O),
                e = o.getElementsByTagName(O)[0];
                L.async = 1;
                L.type = 'text/javascript';
                L.id = id;
                L.src = '';
                e.parentNode.insertBefore(L,e);
                */
                $LAB
                .script("http://www.google.com/adsense/search/async-ads.js").wait(callback);
            })(window,document,'script','_googCsa');
        }
        callback();
    }
});

module.exports.id = 'partials/adserving';
