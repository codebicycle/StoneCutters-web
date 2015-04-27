'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var helpers = require('../../helpers');
var Metric = require('../../modules/metric');
var config = require('../../../shared/config');

Backbone.noConflict();

module.exports = Backbone.Model.extend({
    initialize: initialize,
    isEnabled: isEnabled,
    checkNotifications: checkNotifications,
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

function checkPermission() {
    return window.Notification.permission;
}

function requestPermission() {
    if (this.app.session.get('siteLocation') === this.app.session.get('location').url) {
        window.Notification.requestPermission(function (status) {
            if (window.Notification.permission !== status) {
                window.Notification.permission = status;
            }
            this.metric.increment(['conversations', 'notifications', status]);
        }.bind(this));
    }
}

function showNotification(title, user, path) {
    var options = {
        body: user.unreadConversationsCount,
        icon: 'http://www.olx.com.ar:3030/images/desktop/logo.png'
    };
    var n = new window.Notification(title, options);
    n.onshow = function () {
        setTimeout(n.close.bind(n), 5000);
    };
    n.onclick = function () {
        path = helpers.common.link(path, this.app);
        this.app.router.redirectTo(path);
    }.bind(this);
}
