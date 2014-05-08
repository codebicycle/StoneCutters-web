'use strict';

var _ = require('underscore');

var analyticsParams = {
    category: {
        name: 'category-name',
        nameParentNameSubName: '[category-name]/[subcategory-name]',
        nameParentNameSubId: '[category-name]/[subcategory-id]',
        nameParentName: '[category-name]',
        nameSubName: '[subcategory-name]',
        nameSubId: '[subcategory-id]',
        parse: function (url, options) {
            if (options.parentCategory && options.subCategory) {
                url = url.replace(this.nameParentName, options.parentCategory.name);
                url = url.replace(this.nameSubName, options.subCategory.name);
                url = url.replace(this.nameSubId, options.subCategory.id);
            }
            else if (options.parentCategory && !options.subCategory) {
                url = url.replace(this.nameParentName, options.parentCategory.name);
                url = url.replace(this.nameSubName, 'nocat');
                url = url.replace(this.nameSubId, 'nocat');
            }
            else {
                url = url.replace(this.nameParentNameSubName, 'nocat');
                url = url.replace(this.nameParentNameSubId, 'nocat');
            }
            this.clean(options);
            return url;
        },
        clean: function(options) {
            delete options.parentCategory;
            delete options.subCategory;
        }

    },
    item: {
        name: 'item attributes',
        parse: function (url, options) {
            this.clean(options);
            return url;
        },
        clean: function(options) {
        }
    },
    filters: {
        name: 'filter_name_value',
        parse: function (url, options) {
            this.clean(options);
            return url;
        },
        clean: function(options) {
        }
    }
};

function generatePage(url, options) {
    var page = url.google;
    var token;

    _.each(analyticsParams, function(analyticParam) {
        token = '[' + analyticParam.name + ']';
        if (~page.indexOf(token)) {
            page = analyticParam.parse(page, options);
        }
    });
    return page;
}

module.exports = {
    generatePage: generatePage
};
