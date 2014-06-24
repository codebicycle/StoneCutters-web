'use strict';

var Category = require('../models/category');
var Base = require('./base');

module.exports = Base.extend({
    model: Category,
    url: function() {
        var url = '/countries/' + this.params.location + '/categories';

        delete this.params.location;
        if (this.params) {
            url += '?';
            for (var param in this.params) {
                url += param + '=:' + param + '&';
            }
            url = url.slice(0, url.length - 1);
        }
        return url;
    },
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
