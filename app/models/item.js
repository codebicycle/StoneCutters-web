'use strict';

var Base = require('./base');

module.exports = Base.extend({
    url: function() {
        var url = '/items/:id';

        if (this.get('token')) {
            url += '?token=:token';
        }
        return url;
    },
    idAttribute: 'id'
});

module.exports.id = 'Item';
