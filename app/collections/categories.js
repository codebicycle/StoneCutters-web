'use strict';

var Category = require('../models/category');
var Base = require('./base');

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
