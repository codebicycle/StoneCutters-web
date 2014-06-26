'use strict';

var _ = require('underscore');
var Base = require('../../bases/view');
var helpers = require('../../helpers');
var analytics = require('../../analytics');

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

            analytics.reset();
            analytics.setPage('pages#interstitial');
            this.app.session.persist({
                downloadApp: '1'
            }, {
                maxAge: this.app.session.get('downloadApp')
            });
            img = $('<img/>');
            img.addClass('analytics');
            img.attr('src', analytics.generateURL.call(this));
            interstitial.append(img);
        }
    }
});

module.exports.id = 'pages/interstitial';
