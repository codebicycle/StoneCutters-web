var Base = require('../../../../../common/app/bases/view').requireView('categories/list');
var _ = require('underscore');

module.exports = Base.extend({
    events: {
        'click #categories .category > h2 > a': 'expandSubCat'
    },
    expandSubCat: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var className = 'expanded';
        var currentCategory = $(event.target).parents('.category');
        var allCategories = this.$('.category');
        var allSubCategories = this.$('.subcategories');
        var currentCategoryHasClass = currentCategory.hasClass(className);

        allCategories.removeClass(className);
        allSubCategories.stop(1, 1).slideUp();

        if(!currentCategoryHasClass) currentCategory.addClass(className).find('.subcategories').stop(1, 1).slideDown();
    }
});