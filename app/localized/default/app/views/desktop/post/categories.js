'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    tagName: 'section',
    id: 'posting-categories-view',
    className: 'posting-categories-view wrapper',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        return _.extend({}, data, {
            categories: this.parentView.options.categories.toJSON()
        });
    },
});

module.exports.id = 'post/categories';
