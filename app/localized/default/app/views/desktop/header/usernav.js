'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('header/usernav');
var helpers = require('../../../../../../helpers');
var asynquence = require('asynquence');
var Metric = require('../../../../../../modules/metric');
var Notifications = require('../../../../../../modules/notifications');

module.exports = Base.extend({
	tagName: 'aside',
	id: 'user-nav-bar',
    className: 'header-usernav-view wrapper',
    events: {
        'click [data-increment-metric]': Metric.incrementEventHandler
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var isHermesEnabled = helpers.features.isEnabled.call(this, 'hermes');

        return _.extend({}, data, {
            isHermesEnabled: isHermesEnabled
        });
    },
    postRender: function () {
        this.listenTo(this.app, 'login', this.render);
        $('body').on('update:notifications', this.showNotification.bind(this));
        this.app.router.appView.on('header:hide', this.onHeaderHide.bind(this));
        this.app.router.appView.on('header:show', this.onHeaderShow.bind(this));
    },
    showNotification: function() {
        var user = this.app.session.get('user');
        var messages = this.app.session.get('messages');
        var isHermesEnabled = helpers.features.isEnabled.call(this, 'hermes');

        if ((user || messages >= 0) && isHermesEnabled) {
            this.unreadConversations();
        }
    },
    unreadConversations: function() {
        var user = this.app.session.get('user');
        var messages = this.app.session.get('messages');

        if (user && user.unreadConversationsCount) {
            this.$('.count').text(user.unreadConversationsCount).removeClass('display-none');

            this.sendNotification('/myolx/conversations');
            
        }
        else if (messages && messages > 0) {
            this.$('.count').text(messages).removeClass('display-none');
            this.$('.notificationsLogout').removeClass('display-none');

            this.sendNotification('/login');
        }
        else {
            this.$('.count').addClass('display-none').empty();
            this.$('.notificationsLogout').addClass('display-none');
        }
    },
    sendNotification: function(url) {
        var showNotification = this.app.session.get('showNotification');
        var icon;
        var body;

        if (!showNotification) {
            return;
        }

        if (!this.notifications) {
            this.notifications = new Notifications({}, this);
        }
        if(this.notifications.isEnabled() && this.notifications.checkNotifications()) {
            this.notifications.checkPermission(function callback(status) {
                if (status === 'granted') {
                    icon = helpers.common.static.call(this, '/images/common/logo_notification.png');

                    if (showNotification > 1) {
                        body = 'Tenes ' + showNotification + ' mensajes sin leer.';
                    }
                    else {
                        body = 'Tenes ' + showNotification + ' mensaje sin leer.';
                    }

                    this.notifications.showNotification('OLX', body, url, icon);
                }
            }.bind(this));
        }
    },
    onHeaderHide: function() {
        this.$el.hide();
    },
    onHeaderShow: function() {
        this.$el.show();
    }
});

