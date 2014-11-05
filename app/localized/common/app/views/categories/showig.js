'use strict';

var Base = require('../../bases/view');

module.exports = Base.extend({
    className: 'categories_showig_view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
    }
});

module.exports.id = 'categories/showig';
