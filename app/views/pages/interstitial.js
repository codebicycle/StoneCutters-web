'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var helpers = require('../../helpers');

module.exports = Base.extend({
    className: 'pages_intertitial_view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
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
                this.app.session.clear('interstitial');
            }.bind(this));

            this.attachTrackMe('interstitial-action', function(category, action) {
                return {
                    custom: [category, '-', '-', action].join('::')
                };
            });

            helpers.analytics.reset();
            helpers.analytics.setPage('pages#interstitial');
            this.app.session.persist({
                downloadApp: '1'
            }, {
                maxAge: this.app.session.get('downloadApp')
            });
            img = $('<img/>');
            img.addClass('analytics');
            img.attr('src', helpers.analytics.generateURL(this.app.session.get()));
            interstitial.append(img);
        }
    }
});

module.exports.id = 'pages/interstitial';
