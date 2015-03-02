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

        asynquence()
            .then(unreadCheck.bind(this))
            .val(success.bind(this));

        function unreadCheck(done) {
            helpers.dataAdapter.get(this.app.req, '/conversations/unread/count', {
                query: {
                    token: user.token,
                    userId: user.userId,
                    location: this.app.session.get('location').url,
                    platform: this.app.session.get('platform')
                },
                cache: false,
                json: true
            }, done.errfcb);
        }

        function success(res, body) {
            if (body.count) {
                return this.$('.count').text('(' + body.count + ')');
            }
            return this.$('.count').empty();
        }
    }
});
