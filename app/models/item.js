'use strict';

var Base = require('./base');

module.exports = Base.extend({
    url: function() {
        var url = '/items/:id';
        var prefix = '?';

        if (this.get('token')) {
            url += prefix + 'token=:token';
            prefix = '&';
        }
        if (this.get('securityKey')) {
            url += prefix + 'securityKey=:securityKey';
            prefix = '&';
        }
        if (this.get('languageId')) {
            url += prefix + 'languageId=:languageId';
            prefix = '&';
        }
        if (this.get('languageCode')) {
            url += prefix + 'languageCode=:languageCode';
        }
        return url;
    },
    idAttribute: 'id'
});

module.exports.id = 'Item';
