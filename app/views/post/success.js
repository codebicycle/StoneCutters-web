'use strict';

var BaseView = require('../base');
var _ = require('underscore');

module.exports = BaseView.extend({
    className: 'post_success_view',
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