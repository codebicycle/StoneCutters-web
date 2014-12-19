'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('users/myolx');
var Items = require('../../../../../../collections/items');

module.exports = Base.extend({
    postRender: function() {
        this.items = this.items || this.options.items && this.options.items.toJSON ? this.options.items : new Items(this.options.items || {}, {
            app: this.app
        });
    }
});

module.exports.id = 'users/myolx';
