'use strict';

var _ = require('underscore');

module.exports = function categoriesHelper() {
    var getCat = function(session, catId) {
        var name = '';
        var categories = session.categories;
        var category = categories._byId[catId];

        if (!category) {
            categories = session.childCategories;
            category = categories[catId];
        }
        return category;
    };

    var getCatName = function(session, viewData) {
        var name = '';
        var categories = session.categories;
        var url = session.url;
        var catId = getCatId(url, viewData);

        var category = categories._byId[catId];

        if(category){
            name = category.name;
        }
        else{
            var childCats = session.childCategories;
            var subCat = childCats[catId];

            if (subCat) {
                var parentCat = categories._byId[subCat.parentId];
                name = parentCat.name;
            }
        }

        return name;
    };

    var getSubCatName = function(session, viewData) {
        var name = '';

        var catId = getCatId(session.url, viewData);
        var childCats = session.childCategories;
        var subCat = childCats[catId];

        if (subCat) {
            name = subCat.name;
        }

        return name;
    };

    var getCatId = function (url, viewData) {
        var catIndex = url.indexOf('categories');
        var catIdIndex = url.indexOf('categoryId');
        var catId = 0;

        if (catIndex != -1) {
            var qMarkIndex = url.indexOf('?',catIndex+11);
            catId = parseInt(url.substring(catIndex+11,qMarkIndex),10);
        }
        else if (catIdIndex != -1) {
            var ampIndex = url.indexOf('&',catIdIndex+11);
            catId = parseInt(url.substring(catIdIndex+11,ampIndex),10);
        }
        else if(viewData && viewData.item){
            catId = viewData.item.category.id;
        }

        return catId;
    };

    var api = {
        getCat: getCat,
        getCatName: getCatName,
        getSubCatName: getSubCatName,
    };

    return api;
}();
