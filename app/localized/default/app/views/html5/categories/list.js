'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('categories/list');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'categories_list_view',
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
