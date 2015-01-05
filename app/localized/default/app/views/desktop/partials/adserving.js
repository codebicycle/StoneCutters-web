'use strict';

var Base = require('../../../../../common/app/bases/view');
var _ = require('underscore');
var AdServing = require('../../../../../../modules/adserving');
var translations = require('../../../../../../../shared/translations');

module.exports = Base.extend({
    className: 'adserving-listing',
    initialize: function() {
        Base.prototype.initialize.call(this);
        this.dictionary = translations[this.app.session.get('selectedLanguage') || 'en-US'];
    },
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

        if (type == 'CSA' || type == 'AFC') {
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
        }
        if (type == 'CSA') {
            this._includeCsaLib();
            window._googCsa('ads', settings.options, settings.params);
        }
        else if (type == 'ADX') {
            this.createIframeADX({
                slotname: slotname,
                width: settings.params.width,
                height: settings.params.height,
                slotId: settings.params.slotId,
                pubId: settings.options.pubId
            });
        }
        else if (type == 'AFC') {
            this.createIframeAFC({
                slotname: slotname,
                width: settings.params.width,
                height: settings.params.height,
                media: settings.params.media,
                hints: settings.options.query,
                number: settings.params.number,
                slotId: settings.params.slotId,
                pubId: settings.options.pubId,
                channel: settings.options.channel
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
    createIframeADX: function(params) {
        $('<iframe></iframe>')
        .attr({
            height: params.height,
            width: params.width,
            src: 'about:blank',
            id: params.slotname + '_iframe'
        }).on('load', function() {
            var domIfr = this.contentDocument || this.contentWindow.document;
            var ifrScripts = [];

            ifrScripts.push('google_ad_client = "' + params.pubId + '";');
            ifrScripts.push('google_ad_slot = "' + params.slotId + '";');
            ifrScripts.push('google_ad_width = "' + params.width + '";');
            ifrScripts.push('google_ad_height = "' + params.height + '";');

            domIfr.write('<script type="text/javascript">' + ifrScripts.join('\n') + '</script><script type="text/javascript" src="http://pagead2.googlesyndication.com/pagead/show_ads.js"></script><style>body{margin:0;}</style>');
        }).appendTo('#' + params.slotname);
    },
    createIframeAFC: function(params) {
        var boxTitle = this.dictionary["adsense.SponsoredLinks"];

        $('<iframe></iframe>')
        .attr({
            height: 1,
            width: 1,
            src: 'about:blank',
            id: params.slotname + '_iframe'
        }).on('load', function() {
            var domIfr = this.contentDocument || this.contentWindow.document;
            var ifrScripts = [];

            ifrScripts.push('google_ad_client = "' + params.pubId + '";');
            ifrScripts.push('google_safe = "medium";');
            ifrScripts.push('google_ad_type = "' + params.media + '";');
            ifrScripts.push('google_image_size = "' + params.width + 'x' + params.height + '";');
            ifrScripts.push('google_ad_output = "js";');
            ifrScripts.push('google_ad_channel =  "' + params.channel + '";');
            ifrScripts.push('google_max_num_ads =  ' + params.number + ';');
            ifrScripts.push('google_hints = "' + params.hints + '";');
            ifrScripts.push('google_ad_section = "title body";');
            ifrScripts.push('google_ad_request_done = function(r){ window.parent.AFCrender(r, "' + params.slotname + '", "' + boxTitle + '"); };');

            domIfr.write('<script type="text/javascript">' + ifrScripts.join('\n') + '</script><script type="text/javascript" src="http://pagead2.googlesyndication.com/pagead/show_ads.js"></script>');
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
