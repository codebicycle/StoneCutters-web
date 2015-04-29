'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var helpers = require('../../helpers');
var Metric = require('../../modules/metric');
var config = require('../../../shared/config');
var Localstorage;

Backbone.noConflict();

module.exports = Backbone.Model.extend({
    initialize: initialize,
    isEnabled: isEnabled,
    checkNotifications: checkNotifications,
    checkPermission: checkPermission,
    requestPermission: requestPermission,
    showNotification: showNotification
});

function initialize(attrs, options) {
    this.app = options.app;
    this.metric = new Metric({}, options);
}

function isEnabled() {
    var locationUrl = this.app.session.get('location').url;
    var platform = this.app.session.get('platform');

    return config.getForMarket(locationUrl, ['notifications', platform, 'enabled'], false);
}

function checkNotifications() {
    return !!window.Notification;
}

function checkPermission(done) {
    if (this.app.session.get('siteLocation') === this.app.session.get('location').url) {
        return callback(window.Notification.permission);
    }
    window.LocalCache.checkPermission().done(callback);

    function callback(status) {
        done(status);
    }
}

function requestPermission(done) {
    if (this.app.session.get('siteLocation') === this.app.session.get('location').url) {
        return window.Notification.requestPermission(function (status) {
            if (window.Notification.permission !== status) {
                window.Notification.permission = status;
            }
            callback(status);
        });
    }
    window.LocalCache.requestPermission().done(callback.bind(this));

    function callback(status) {
        this.metric.increment(['conversations', 'notifications', status]);
    }
    
}

function showNotification(title, body, path, icon) {
    this.metric.increment(['conversations', 'notifications', 'show']);
    if (this.app.session.get('siteLocation') === this.app.session.get('location').url) {
        var options = {
            body: body,
            icon: icon
        };
        var n = new window.Notification(title, options);
        // n.onshow = function () {
        //     setTimeout(n.close.bind(n), 5000);
        // };
        n.onshow = callback.bind(this);
        n.onclick = callback.bind(this);
        n.onclose = callback.bind(this);
    }
    else {
        window.LocalCache.showNotification(title, body, icon).done(callback.bind(this));
    }

    

    function callback(event) {
        var action = event.type;
        //console.log(action);
        this.metric.increment(['conversations', 'notifications', action]);
        if (action === 'click') {
            path = helpers.common.link(path, this.app);
            this.app.router.redirectTo(path);
        }
    }
}
