'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('post/editsuccess');

module.exports = Base.extend({
    postRender: function() {
        var category = 'Posting';
        var action = 'EditSuccess';
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
