'use strict';

var BaseView = require('../base');
var _ = require('underscore');
var helpers = require('../../helpers');

module.exports = BaseView.extend({
    className: 'footer_intertitial_view',
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

        if (interstitial.length) {
            interstitial.prependTo($('body'));
            $(views).addClass('hide');
            
            this.$('.closeInterstitial').on('click', function(e) {
                e.preventDefault();
                interstitial.remove();
                $(views).removeClass('hide');
                this.app.deleteSession('interstitial');
            }.bind(this));

            this.attachTrackMe(this.className, function(category, action) {
                return {
                    custom: [category, '-', '-', action].join('::')
                };
            });
        }
    }
});

module.exports.id = 'footer/interstitial';
