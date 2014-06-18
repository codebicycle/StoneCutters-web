'use strict';

var BaseView = require('../base');
var _ = require('underscore');
var helpers = require('../../helpers');

module.exports = BaseView.extend({
    className: 'items_reply_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);
        data.fields = [{ name: 'message', label: 'replymessage.Message', mandatory: 'true'},{name: 'name', label: 'replymessage.Name', mandatory: 'false'}, {name: 'email', label: 'replymessage.Email', mandatory: 'true'}, {name: 'phone', label: 'itemgeneraldetails.Phone'}];

        return _.extend({}, data, {
            breadcrumb: helpers.breadcrumb.get.call(this, data)
        });
    }
});

module.exports.id = 'items/reply';
