'use strict';

var Base = require('../bases/collection');
var Category = require('../models/category');

module.exports = Base.extend({
    model: Category,
    url: '/countries/:location/categories',
    search: function(id) {
        var category = this.get(id);
        var parent;

        if (!category) {
            parent = this.find(function each(category) {
                return !!category.get('children').get(id);
            });
            if (parent) {
                category = parent.get('children').get(id);
            }
        }
        return category;
    },
    parse: function(response) {
        if (response.categories) {
            this.metadata = response.metadata;
            return response.categories;
        }
        return response;
    }
});

module.exports.id = 'Categories';
