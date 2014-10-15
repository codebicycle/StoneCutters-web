'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'posting-success-view',
    id: 'posting-success-view',
    tagName: 'main',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        
        return _.extend({}, data, {
            breadcrumb: helpers.breadcrumb.get.call(this, data)
        });
    },
    postRender: function() {
        var category = 'Posting';
        var action = 'PostingSuccess';
        var itemId = $('.itemId').val();
        var itemCategory = $('.itemCategory').val();
        var itemSubcategory = $('.itemSubcategory').val();

        this.track({
            category: category,
            action: action,
            custom: [category, itemCategory, itemSubcategory, action, itemId].join('::')
        });
    }
});

module.exports.id = 'post/success';
