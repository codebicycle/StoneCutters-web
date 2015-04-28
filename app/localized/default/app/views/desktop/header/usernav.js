'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('header/usernav');
var helpers = require('../../../../../../helpers');
var asynquence = require('asynquence');
var Metric = require('../../../../../../modules/metric');

module.exports = Base.extend({
	tagName: 'aside',
	id: 'user-nav-bar',
    className: 'header-usernav-view',
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
        }
        else if (messages && messages > 0) {
            this.$('.count').text(messages).removeClass('display-none');
            this.$('.notificationsLogout').removeClass('display-none');
        }
        else {
            this.$('.count').addClass('display-none').empty();
            this.$('.notificationsLogout').addClass('display-none');
        }
    }
});

