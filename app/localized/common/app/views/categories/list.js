'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var breadcrumb = require('../../../../../modules/breadcrumb');
var userzoom = require('../../../../../modules/userzoom');

module.exports = Base.extend({
    className: 'categories_list_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        this.userzoom = new userzoom({}, {
            app: this.app
        });
        
        return _.extend({}, data, {
            location: this.app.session.get('location'),
            breadcrumb: breadcrumb.get.call(this, data),
            isUserzoomEnabled: this.userzoom.isEnabled(),
            userzoom: this.userzoom.getParams()
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

module.exports.id = 'categories/list';
