'use strict';

var _ = require('underscore');

module.exports = function categoriesHelper(){
    var getCatName = function(session) {
        var name = '';
        var categories = session.categories;
        var url = session.url;
        var catId = getCatId(url);

        var category = categories._byId.catId;

        if(category){
            name = category.name;
        }else{
            var childCats = session.childCategories;
            var subCat = childCats[catId];

            if (subCat) {
                var parentCat = categories._byId[subCat.parentId];
                name = parentCat.name;
            }
        }

        return name;
    };

    var getSubCatName = function(session) {
        var name = '';
        
        var catId = getCatId(session.url);
        var childCats = session.childCategories;
        var subCat = childCats[catId];

        if (subCat) {
            name = subCat.name;
        }

        return name;
    };

    var getCatId = function (url) {
        var catIndex = url.indexOf('category');
        var catId = 0;

        if (catIndex != -1) {
            var catIdIndex = url.indexOf('categoryId');
            if (catIdIndex != -1) {
                var ampIndex = url.indexOf('&',catIdIndex+11);
                catId = parseInt(url.substring(catIdIndex+11,ampIndex),10);
            }else{
                var qMarkIndex = url.indexOf('?',catIndex+9);
                catId = parseInt(url.substring(catIndex+9,qMarkIndex),10);
            }
        }

        return catId;
    };

    var api = {
        getCatName: getCatName,
        getSubCatName: getSubCatName,
    };

    return api;
}();
