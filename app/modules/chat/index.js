'use strict';

var _ = require('underscore');
var config = require('../../../shared/config');

function isEnabled() {
    var location = this.app.session.get('location');
    var enabled = config.getForMarket(location.url, ['chat', 'enabled'], false);
    var currentRoute = this.app.session.get('currentRoute');

    if (enabled) {
        enabled = config.getForMarket(location.url, ['chat', 'sections', (currentRoute.controller+'#'+currentRoute.action), 'enabled'], false);
    }
    return enabled;
}

function show() {
    if(isEnabled.call(this) && window.$zopim) {
        window.asyncApi = window.asyncApi || [];
        window.asyncApi.push({
            wait: function() {
                return typeof window.$zopim.livechat !== 'undefined';
            },
            callback: function() {
                window.$zopim.livechat.window.show();
            }
        });
    }
}

function hide() {
    if(isEnabled.call(this) && window.$zopim) {
        window.$zopim.livechat.hideAll();
    }
}

module.exports = {
    isEnabled: isEnabled,
    show: show,
    hide: hide
};
