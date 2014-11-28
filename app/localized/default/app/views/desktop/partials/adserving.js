'use strict';

var Base = require('../../../../../common/app/bases/view');
var _ = require('underscore');
var AdServing = require('../../../../../../modules/adserving');

module.exports = Base.extend({
    className: 'adserving-listing',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            adserving: {
                enabled : AdServing.isEnabled.call(this),
                slotname: this.options.subId
            }
        });
    },
    postRender: function() {
        if (!AdServing.isEnabled.call(this)) {
            return;
        }
        var settings = AdServing.getSettings.call(this);

        this._checkCsaLib();

        window._googCsa('ads', settings.options, settings.params);
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
    }
});

module.exports.id = 'partials/adserving';
