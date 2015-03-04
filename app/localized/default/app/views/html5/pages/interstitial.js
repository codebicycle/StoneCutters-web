'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('pages/interstitial');
var helpers = require('../../../../../../helpers');
var config = require('../../../../../../../shared/config');
var maxAge = config.get(['interstitial', 'time'], 60000);

module.exports = Base.extend({
    postRender: function() {
        var interstitial = this.$('#interstitial');
        var header = $('.header_index_view');
        var views = $('[data-view]');

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

        this.attachTrackMe(function onTrackMe(category, action) {
            return {
                custom: category
            };
        }.bind(this), $('#interstitial'));
        this.track({
            category: 'Interstitial',
            action: 'View',
            custom: 'interstitial_view'
        });
        this.app.session.persist({
            showInterstitial: '1'
        }, {
            maxAge: maxAge
        });
    }
});
