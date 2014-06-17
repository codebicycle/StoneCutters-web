'use strict';

var BaseView = require('../base');
var _ = require('underscore');

module.exports = BaseView.extend({
    className: 'header_bar_view',
    wapAttributes: {
        bgcolor: '#333333'
    },
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            blackBar: this.app.session.get('blackBar')
        });
    }
});

module.exports.id = 'header/bar';
