'use strict';

var BaseView = require('../base');
var _ = require('underscore');

module.exports = BaseView.extend({
    className: 'home_index_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            location: this.app.session.get('location')
        });
    },
    postRender: function() {
        if ($('.registerSuccess').length) {
            var category = 'Account';
            var action = 'register_confirmation';

            this.track({
                category: category,
                action: action,
                custom: [category, '-', '-', action].join('::')
            });
        }
    }
});

module.exports.id = 'home/index';
