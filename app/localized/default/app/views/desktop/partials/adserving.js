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
            if(this.isGoogleReferer() && settings.seo){
                settings.params = _.extend({}, settings.params, {
                    number: settings.seo
                });
                settings.options = _.extend({}, settings.options, {
                    channel: settings.options.channel.replace('Organic', 'SEO')
                });
            }
            settings.options = _.extend({}, settings.options, {
                channel: settings.options.channel.replace('[navigator]', this.getBrowser().browsername)
            });
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
    isGoogleReferer: function() {
        return document.referrer.match(/^[a-zA-Z0-9:\/\/]*\.google\.[a-zA-Z.]+/) && (document.location.search.indexOf("invite=") == -1);
    },
    getBrowser: function() {
        var BrowserDetect = {
            init: function () {
                this.browser = this.searchString(this.dataBrowser) || '';
                this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || '';
                this.browsername = this.browser + this.version;
            },
            searchString: function(data) {
                for (var i = 0; i < data.length; i++) {
                    var dataString = data[i].string;
                    var dataProp = data[i].prop;
                    this.versionSearchString = data[i].versionSearch || data[i].identity;
                    if (dataString) {
                        if (dataString.indexOf(data[i].subString) != -1) {
                            return data[i].identity;
                        }
                    }
                    else if (dataProp) {
                        return data[i].identity;
                    }
                }
            },
            searchVersion: function(dataString) {
                var index = dataString.indexOf(this.versionSearchString);
                var versionIndex;

                if (index == -1) {
                    return;
                }
                versionIndex = index + this.versionSearchString.length + 1;
                return parseFloat(dataString.substring(versionIndex));
            },
            dataBrowser: [
                {
                    string: navigator.userAgent,
                    subString: "Chrome",
                    identity: "Chrome"
                },
                {
                    string: navigator.userAgent,
                    subString: "OmniWeb",
                    versionSearch: "OmniWeb/",
                    identity: "OmniWeb"
                },
                {
                    string: navigator.vendor,
                    subString: "Apple",
                    identity: "Safari",
                    versionSearch: "Version"
                },
                {
                    prop: window.opera,
                    identity: "Opera",
                    versionSearch: "Version"
                },
                {
                    string: navigator.vendor,
                    subString: "iCab",
                    identity: "iCab"
                },
                {
                    string: navigator.vendor,
                    subString: "KDE",
                    identity: "Konqueror"
                },
                {
                    string: navigator.userAgent,
                    subString: "Firefox",
                    identity: "Firefox"
                },
                {
                    string: navigator.vendor,
                    subString: "Camino",
                    identity: "Camino"
                },
                {
                    string: navigator.userAgent,
                    subString: "Netscape",
                    identity: "Netscape"
                },
                {
                    string: navigator.userAgent,
                    subString: "MSIE",
                    identity: "Explorer",
                    versionSearch: "MSIE"
                },
                {
                    string: navigator.userAgent,
                    subString: "Gecko",
                    identity: "Mozilla",
                    versionSearch: "rv"
                },
                {
                    string: navigator.userAgent,
                    subString: "Mozilla",
                    identity: "Netscape",
                    versionSearch: "Mozilla"
                }
            ]
        };
        BrowserDetect.init();

        return BrowserDetect;
    }
});

module.exports.id = 'partials/adserving';
