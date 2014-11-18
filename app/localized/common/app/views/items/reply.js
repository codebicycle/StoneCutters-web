'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var breadcrumb = require('../../../../../modules/breadcrumb');

module.exports = Base.extend({
    className: 'items_reply_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        data.fields = [{ name: 'message', label: 'replymessage.Message', mandatory: 'true'},{name: 'name', label: 'replymessage.Name', mandatory: 'false'}, {name: 'email', label: 'replymessage.Email', mandatory: 'true'}, {name: 'phone', label: 'itemgeneraldetails.Phone'}];

        return _.extend({}, data, {
            breadcrumb: breadcrumb.get.call(this, data)
        });
    }
});

module.exports.id = 'items/reply';
