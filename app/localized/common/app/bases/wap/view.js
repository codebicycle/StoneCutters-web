'use strict';

var Base = require('../view');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'wap',
    initialize: function() {
        if (this.tagName === 'div') {
            this.tagName = 'table';
        }
        if (this.tagName === 'table') {
            this.attributes = this.getWapAttributes();
        }
    },
    getWapAttributes: function() {
        return _.extend(this.attributes || {}, {
            width: '100%',
            cellspacing: 0,
            cellpadding: 4,
            border: 0
        }, this.wapAttributes || {});
    }
});
