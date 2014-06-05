'use strict';

module.exports = function categoriesHelper() {
    function get(app, catId) {
        var categories = app.getSession('categories');
        var category = categories._byId[catId];

        if (!category) {
            categories = app.getSession('childCategories');
            category = categories[catId];
        }
        return category;
    }

    function getTree(app, catId) {
        var category = get(app, catId);
        var subCategory;

        if (category && category.parentId) {
            subCategory = category;
            category = get(app, subCategory.parentId);
        }
        return {
            parent: category,
            subCategory: subCategory 
        };
    }

    return {
        get: get,
        getTree: getTree
    };
}();
