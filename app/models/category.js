'use strict';

var Base = require('../bases/model');
var config = require('../../shared/config');
var helpers = require('../helpers');

module.exports = Base.extend({
    url: '/countries/:location/categories/:id',
    idAttribute: 'id',
    parse: function(result) {
        var digits = config.getForMarket(this.app.session.get('location').url, ['layoutOptions', 'digits'], {});
        var Collection = require('../collections/categories');

        result.children = new Collection(result.children, {parse: true, app: this.app});
        result.localized = {
            'counter': (digits !== 'western-arabic') ? helpers.numbers.translate(result.counter, {to: digits}) : result.counter
        };
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
