'use strict';

var BaseView = require('../base');
var _ = require('underscore');

module.exports = BaseView.extend({
    className: 'location_select_view',
    wapAttributes: {
        bgcolor: '#DDDDDD'
    },
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            location: this.app.session.get('location')
        });
    }
});

module.exports.id = 'location/select';
