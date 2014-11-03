'use strict';

var Base = require('../bases/collection');
var Category = require('../models/category');
var _ = require('underscore');

function get(categories, id) {
    return _.find(categories, function each(category) {
        return category.id === id;
    });
}

module.exports = Base.extend({
    model: Category,
    url: '/countries/:location/categories',
    search: function(id) {
        var category = this.get(id);
        var parent;

        if (!category) {
            parent = this.find(function each(category) {
                var children = category.get('children');

                if (children.get) {
                    return !!children.get(id);
                }
                return !!get(children, id);
            });
            if (parent) {
                var children = parent.get('children');

                if (children.get) {
                    category = children.get(id);
                }
                else {
                    category = get(children, id);
                }
            }
        }
        return category;
    },
    parse: function(response) {
        if (response) {
            if (response.categories) {
                this.meta = response.metadata;
                return response.categories;
            }
        }
        else {
            console.log('[OLX_DEBUG] Empty category listing response');
            response = [];
        }
        return response;
    }
});

module.exports.id = 'Categories';
module.exports.cache = true;
