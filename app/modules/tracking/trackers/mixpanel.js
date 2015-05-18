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
    return utils.get(configTracking, ['mixpanel', 'enviroment', config.get(['environment', 'type'])], []);
}

function getPageName(currentRoute) {
    var configRouteDefault = utils.get(configTracking, ['mixpanel', 'routes', currentRoute.controller, 'default', 'pagename']);

    return utils.get(configTracking, ['mixpanel', 'routes', currentRoute.controller, currentRoute.action, 'pagename'], configRouteDefault);
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
    var currentLocation = location.name;
    var userStatus = !!this.app.session.get('user');
    var pageName;
    var events = utils.get(configTracking, ['mixpanel', 'keywords', 'events'], {});
    
    props = props || {};
    eventName = utils.get(events, [eventName]);

    if (_.contains([events.search, events.postStarted], eventName)) {
        pageName = getPageName(currentRoute);
    }

    _.extend(props, {
        loggedIn: +userStatus
    });

    if (pageName) {
        _.extend(props, {
            from: pageName
        });
    }

    if (currentLocation) {
        _.extend(props, {
            defaultCity: currentLocation
        });
    }

    props = parseObject(props, utils.get(configTracking, ['mixpanel', 'keywords', 'properties'], {}));

    window.mixpanel.track(eventName, props || {});
}

module.exports = {
    isEnabled: isEnabled,
    getParams: getParams,
    track: track
};
