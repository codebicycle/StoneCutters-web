'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('footer/downloadapp');
var config = require('../../../../../../../shared/config');
var _ = require('underscore');

module.exports = Base.extend({
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var currentRoute = this.app.session.get('currentRoute');

        return _.extend({}, data, {
            postingFlow: currentRoute.controller === 'post' && currentRoute.action === 'flow' && this.app.session.get('platform') === 'html5' && config.get(['posting', 'flow', 'enabled', this.app.session.get('siteLocation')], true)
        });
    },
    postRender: function() {
        this.app.router.appView.on('postingflow:start', this.onPostingFlowStart.bind(this));
        this.app.router.appView.on('postingflow:end', this.onPostingFlowEnd.bind(this));
    },
    onPostingFlowStart: function() {
        this.$('#downloadapp').addClass('disabled');
    },
    onPostingFlowEnd: function() {
        this.app.router.once('action:end', this.onPostingFlowAfter.bind(this));
    },
    onPostingFlowAfter: function() {
        this.$('#downloadapp').removeClass('disabled');
    }
});
