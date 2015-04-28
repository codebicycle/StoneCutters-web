'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('post/success');
var Notifications = require('../../../../../../modules/notifications');

module.exports = Base.extend({
    className: 'posting-success-view',
    id: 'posting-success-view',
    tagName: 'main',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        data.item.location.stateName = data.item.location.children[0].name;
        data.item.location.cityName = data.item.location.children[0].children[0].name;
        if (data.item.location.children[0].children[0].children[0]) {
            data.item.location.neighborhoodName = data.item.location.children[0].children[0].children[0].name;
        }
        return data;
    },
    postRender: function () {
        if (!this.notifications) {
                this.notifications = new Notifications({}, this);
            }
        if (this.notifications.isEnabled() && this.notifications.checkNotifications()) {
            this.notifications.checkPermission(function callback(status) {
                if (status === 'default') {
                    this.notifications.requestPermission();
                }
            }.bind(this));
        }
    }
});
