'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('footer/languages');
var utils = require('../../../../../../../shared/utils');
var _ = require('underscore');

module.exports = Base.extend({
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var currentRoute = this.app.session.get('currentRoute');

        return _.extend({}, data, {
            postingFlow: currentRoute.controller === 'post' && currentRoute.action === 'flow'
        });
    },
    postRender: function() {
        $('body').on('change:location', this.changeLocation.bind(this));
        this.app.router.appView.on('postingflow:start', this.onPostingFlowStart.bind(this));
        this.app.router.appView.on('postingflow:end', this.onPostingFlowEnd.bind(this));
    },
    changeLocation: function (e, siteLocation) {
        this.$('.footer-links .footer-link').each(function(i, link) {
            var $link = $(link);
            var href = $link.attr('href');
            var currentLocation = utils.params(href, 'location');

            if (currentLocation !== siteLocation) {
                if (siteLocation && ~siteLocation.indexOf('www')) {
                    href = utils.removeParams(href, 'location');
                }
                else {
                    href = utils.link(href, this.app, {
                        location: siteLocation
                    });
                }
                $link.attr({
                    href: href
                });
            }
        }.bind(this));
    },
    onPostingFlowStart: function() {
        this.$('#languages').addClass('disabled');
    },
    onPostingFlowEnd: function() {
        this.app.router.once('action:end', this.onPostingFlowAfter.bind(this));
    },
    onPostingFlowAfter: function() {
        this.$('#languages').removeClass('disabled');
    }
});
