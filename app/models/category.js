'use strict';

var Base = require('../bases/model');

module.exports = Base.extend({
    url: '/countries/:location/categories/:id',
    idAttribute: 'id',
    parse: function(result) {
        var Collection = require('../collections/categories');

        result.children = new Collection(result.children);
        return result;
    },
    checkSlug: function(categorySlug, urlSlug) {
        var slug = [(urlSlug ? (urlSlug + '-') : ''), 'cat-', this.get('id')].join('');

        if (categorySlug === slug) {
            if (this.app.session.get('path').slice(1).indexOf('-cat-')) {
                return true;
            }
        }       
        return false;
    }
});

module.exports.id = 'Category';
