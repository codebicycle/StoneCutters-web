'use strict';

var Base = require('../bases/collection');
var Category = require('../models/category');

module.exports = Base.extend({
    model: Category,
    url: '/countries/:location/categories',
    search: function(id) {
        var category = this.get(id);

        if (!category) {
            category = this.find(function each(category) {
                return !!category.get('children').get(id);
            });
            if (category) {
                return category.get('children').get(id);
            }
        }
    }
});

module.exports.id = 'Categories';
