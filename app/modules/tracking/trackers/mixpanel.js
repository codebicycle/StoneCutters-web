'use strict';

var _ = require('underscore');
var configTracking = require('../config');
var config = require('../../../../shared/config');
var utils = require('../../../../shared/utils');

function isPlatformEnabled(platforms) {
    return !(platforms && !_.contains(platforms, this.app.session.get('platform')));
}

function isEnabled() {
    var location = this.app.session.get('location');
    var enabled = config.getForMarket(location.url, ['tracking', 'trackers', 'mixpanel', 'enabled'], false);

    if (enabled) {
        enabled = isPlatformEnabled.call(this, config.getForMarket(location.url, ['tracking', 'trackers', 'mixpanel', 'platforms']));
    }
    return enabled;
}

function getParams() {
    return utils.get(configTracking, ['mixpanel', 'environment', config.get(['environment', 'type'])], []);
}

function getPageName(currentRoute) {
    var pageName = utils.get(configTracking, ['mixpanel', 'routes', currentRoute.controller, currentRoute.action, 'pagename']);
    
    if (!pageName) {
        pageName = utils.get(configTracking, ['mixpanel', 'routes', currentRoute.controller, 'default', 'pagename']);
    }

    return pageName;
}

function parseObject(keys, values) {
    return _.reduce(keys, function(result, value, key) {
        key = values[key] || key;
        result[key] = value;
        return result;
    }, {});
}

function track(eventName, props) {
    if (utils.isServer || !window.mixpanel || !eventName) {
        return;
    }

    var currentRoute = this.app.session.get('currentRoute');
    var location = this.app.session.get('location').current || {};
    var events = utils.get(configTracking, ['mixpanel', 'keywords', 'events'], {});
    var pageName;
    
    props = props || {};
    eventName = utils.get(events, [eventName]);

    if (_.contains([events.search, events.postStarted], eventName)) {
        pageName = getPageName(currentRoute);
    }

    props.loggedIn = +!!this.app.session.get('user');

    if (pageName) {
        props.from = pageName;
    }

    if (location.name) {
        props.defaultCity = location.name;
    }

    props = parseObject(props, utils.get(configTracking, ['mixpanel', 'keywords', 'properties'], {}));

    window.mixpanel.track(eventName, props || {});
}

module.exports = {
    isEnabled: isEnabled,
    getParams: getParams,
    track: track
};
