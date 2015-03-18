'use strict';

var navigation = require('./navigation');
var rules = require('./rules');

function prepareNavigation(data) {
    var url = data.app.session.get('path');
    var fragment = navigation.getState.call(data);

    if (fragment && fragment.url === url) {
        navigation.popState.call(data);
        return;
    }
    fragment = navigation.getPrevious.call(data);
    if (fragment && fragment.url === url) {
        if (!data.relatedAds) {
            navigation.popState.call(data);
            navigation.popState.call(data);
        }
        return;
    }
}

function get(data, options) {
    var currentRoute = data.app.session.get('currentRoute');
    var referer = data.app.session.get('referer');
    var breadcrumb;
    var controller;

    options = options || {};

    prepareNavigation(data);
    if (currentRoute.controller !== this.name.split('/').shift() && !options.force) {
        return data.app.session.get('breadcrumb');
    }
    controller = rules[currentRoute.controller];
    if (controller && controller[currentRoute.action]) {
        breadcrumb = controller[currentRoute.action].call(data);
    }
    breadcrumb = breadcrumb || referer || '/';
    data.app.session.update({
        breadcrumb: breadcrumb,
        referer: referer
    });
    return breadcrumb;
}

function getCancel(data) {
    var currentRoute = this.app.session.get('currentRoute');
    var breadcrumb = '/';
    var url;

    switch (currentRoute.action) {
        case 'register':
        case 'lostpassword':
            breadcrumb = '/login';
            break;
        case 'reply':
            breadcrumb = this.app.session.get('path').replace('/reply', '');
            break;
        case 'filter':
            breadcrumb = this.app.session.get('path').replace('/filter', '');
            break;
        case 'sort':
            breadcrumb = this.app.session.get('path').replace('/sort', '');
            break;
    }
    return breadcrumb;
}

module.exports = {
    get: get,
    getCancel: getCancel
};
