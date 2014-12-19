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
        var slotname = this.adServing.get('slotname');

        if (type == 'CSA') {
            if(this.isGoogleReferer() && settings.seo){
                settings.params = _.extend({}, settings.params, {
                    number: settings.seo
                });
                settings.options = _.extend({}, settings.options, {
                    channel: settings.options.channel.replace('Organic', 'SEO')
                });
            }
            settings.options = _.extend({}, settings.options, {
                channel: settings.options.channel.replace('[navigator]', window.BrowserDetect.browsername)
            });
            this._includeCsaLib();

            window._googCsa('ads', settings.options, settings.params);
        }
        else if (type == 'ADX') {
            this.createIframe({
                slotname: slotname,
                width: settings.params.width,
                height: settings.params.height,
                slotId: settings.params.slotId,
                pubId: settings.options.pubId
            });
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
    createIframe: function(params) {
        var $ifr;

        $ifr = $('<iframe></iframe>');
        $ifr.attr({
            height: params.height,
            width: params.width,
            src: 'about:blank',
            id: params.slotname + '_iframe'
        }).on('load', function() {
            var domIfr = this.contentDocument || this.contentWindow.document;

            domIfr.write('<style>body{margin:0;}</style><sc'+'ript type="text/javascript">  google_ad_client = "' + params.pubId + '";  google_ad_slot = "' + params.slotId + '";  google_ad_width = ' + params.width + ';  google_ad_height =  ' + params.height + ';  </sc'+'ript> <scr'+'ipt type="text/javascript"  src="http://pagead2.googlesyndication.com/pagead/show_ads.js"> </sc'+'ript>');
        }).appendTo('#' + params.slotname);
    },
    createIframeAfc: function(params) {
        var $ifr;

        $ifr = $('<iframe></iframe>');
        $ifr.attr({
            height: params.height,
            width: params.width,
            src: 'about:blank',
            id: params.slotname + '_iframe'
        }).on('load', function() {
            var domIfr = this.contentDocument || this.contentWindow.document;
            /*var str = new Array();
            str.push({
                "name": "slot_{{slotName}}",
                "num_ads": {{numAds|number_format}},
                "refered_num_ads": {{seoAds|default(0)|number_format}},
                "layout": "{{cssClass|default('')}}",
                "renderSlot": "{{renderSlot|default('slot_' ~ slotName)}}",
                "renderMethod": "googleUnique"
            });*/

            var params = [];
                params.push('google_ad_client = "' + params.pubId + '";');
                params.push('google_safe = "medium";');
                params.push('google_ad_type = "' + params.media + '";');
                params.push('google_image_size = "' + params.width + 'x' + params.height + '";');
                params.push('google_ad_output = "js";');
                params.push('google_max_num_ads = "' + params.number + '";');
                params.push('google_hints = "' + params.hints + '";');
                params.push('google_ad_section = "title body";');
                params.push('google_ad_client = "' + params.pubId + '";');
                //google_skip = ads_skip;

                // Acá lo que hay que hacer es agarrar lo que hay en FP y pasarlo para asi tener la librería de AFC.


            domIfr.write('<style>body{margin:0;}</style><sc'+'ript type="text/javascript">aca va el push</sc'+'ript> <scr'+'ipt type="text/javascript"  src="http://pagead2.googlesyndication.com/pagead/show_ads.js"> </sc'+'ript>');
        }).appendTo('#' + params.slotname);
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
    isGoogleReferer: function() {
        return document.referrer.match(/^[a-zA-Z0-9:\/\/]*\.google\.[a-zA-Z.]+/) && (document.location.search.indexOf('invite=') == -1);
    }
});

module.exports.id = 'partials/adserving';
