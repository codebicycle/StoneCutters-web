'use strict';

var _ = require('underscore');
var Base = require('../../bases/view');
var helpers = require('../../../../../helpers');
var analytics = require('../../../../../modules/analytics');
var config = require('../../../../../../shared/config');
var maxAge = config.get(['interstitial', 'time'], 60000);

module.exports = Base.extend({
    className: 'pages_intertitial_view hide',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var marketing = helpers.marketing.getInfo(this.app, 'interstitial');

        return _.extend({}, data, {
            marketing: marketing
        });
    },
    postRender: function() {
        var interstitial = this.$('#interstitial');
        var header = $('.header_index_view');
        var views = $('[data-view]');
        var img;
        var analyticInfo;

        if (!interstitial.length) {
            return;
        }

        header.before(interstitial);
        $(views).addClass('hide');

        $('.downloadApp').on('click', function callback(event) {
            this.app.session.persist({
                downloadApp: '1'
            });
        }.bind(this));

        $('.closeInterstitial').on('click', function callback(event) {
            $(views).removeClass('hide');
            interstitial.remove();
            this.app.session.clear('interstitial');
        }.bind(this));

        this.attachTrackMe('interstitial-action', function track(category, action) {
            return {
                custom: [category, '-', '-', action].join('::')
            };
        });

        analytics.reset();
        analytics.setPage('pages#interstitial');
        this.app.session.persist({
            showInterstitial: '1'
        }, {
            maxAge: maxAge
        });

        analyticInfo = analytics.generateURL.call(this);
        _.each(analyticInfo.urls, function(url) {
            img = $('<img/>');
            img.addClass('analytics');
            img.attr('src', url);
            interstitial.append(img);
        }, this);
    }
});

module.exports.id = 'pages/interstitial';
