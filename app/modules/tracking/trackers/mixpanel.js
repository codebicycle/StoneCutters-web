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
    var controller = currentRoute.controller;
    var action = currentRoute.action;
    var pageName;

    if (controller === 'categories' && action === 'list') {
        pageName = 'Home';
    }
    else if ((controller === 'searches' && action === 'allresults') || (controller === 'searches' && action === 'search') || (controller === 'categories' && action === 'show')) {
        pageName = 'Listing';
    }
    else if ((controller === 'searches' && action === 'allresultsig') || (controller === 'categories' && action === 'showig')) {
        pageName = 'Listing gallery';
    }
    else if (controller === 'searches' && action === 'statics') {
        pageName = 'Listing /q';
    }
    else if (controller === 'items' && action === 'show') {
        pageName = 'Item';
    }
    else if (controller === 'pages') {
        if (action === 'help') {
            pageName = 'Help';
        }
        else if (action === 'terms') {
            pageName = 'Terms';
        }
        else {
            pageName = 'Statics';
        }
    }
    else if (controller === 'users') {
        pageName = 'MyAds';
    }

    return pageName;
}

function track(eventName, props) {
    if (utils.isServer || !window.mixpanel || !eventName) {
        return;
    }
    var location = this.app.session.get('location').current || {};
    var currentLocation = location.name;
    var userStatus = !!this.app.session.get('user');
    var currentRoute = this.app.session.get('currentRoute');
    var pageName;
    var properties = props || {};

    if (eventName === 'Search' || eventName === 'Post Started') {
        pageName = getPageName(currentRoute);
    }

    _.extend(properties, {
        'Logged in' : +userStatus
    });

    if (pageName) {
        _.extend(properties, {
            'From' : pageName
        });
    }

    if (currentLocation) {
        _.extend(properties, {
            '$city' : currentLocation || ''
        });
    }

    window.mixpanel.track(eventName, properties || {});
}

module.exports = {
    isEnabled: isEnabled,
    getParams: getParams,
    track: track
};
