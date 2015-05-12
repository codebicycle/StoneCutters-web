'use strict';

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

function getDepartment() {
    var location = this.app.session.get('location');

    return config.getForMarket(location.url, ['chat', 'department'], false);
}

module.exports = {
    isEnabled: isEnabled,
    getDepartment: getDepartment
};
