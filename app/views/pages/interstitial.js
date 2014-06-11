'use strict';

var BaseView = require('../base');
var _ = require('underscore');
var helpers = require('../../helpers');

module.exports = BaseView.extend({
    className: 'pages_intertitial_view',
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);
        var marketing = helpers.marketing.getInfo(this.app, 'interstitial');

        return _.extend({}, data, {
            marketing: marketing
        });
    },
    postRender: function() {
        var interstitial = this.$('#interstitial');
        var views = '[data-view]';
        var img;

        if (interstitial.length) {
            interstitial.prependTo($('body'));
            $(views).addClass('hide');
            
            $('.closeInterstitial').on('click', function(e) {
                interstitial.remove();
                $(views).removeClass('hide');
                this.app.deleteSession('interstitial');
            }.bind(this));

            this.attachTrackMe('interstitial-action', function(category, action) {
                return {
                    custom: [category, '-', '-', action].join('::')
                };
            });

            helpers.analytics.reset();
            helpers.analytics.setPage('pages#interstitial');
            img = $('<img/>');
            img.addClass('analytics');
            img.attr('src', helpers.analytics.generateURL(this.app.getSession()));
            interstitial.append(img);
        }
    }
});

module.exports.id = 'pages/interstitial';
