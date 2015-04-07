'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('header/usernav');
var helpers = require('../../../../../../helpers');
var asynquence = require('asynquence');
var _ = require('underscore');

module.exports = Base.extend({
	tagName: 'aside',
	id: 'user-nav-bar',
    className: 'header-usernav-view',
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
        var isHermesEnabled = helpers.features.isEnabled.call(this, 'hermes');

        if (user && isHermesEnabled) {
            this.unreadConversations();
        }
    },
    unreadConversations: function() {
        var user = this.app.session.get('user');

        if (user.unreadConversationsCount) {
            this.$('.count').text(user.unreadConversationsCount);
            this.$('.count').removeClass('display-none');
        }
        else {
            this.$('.count').addClass('display-none');
            return this.$('.count').empty();
        }
    }
});
