'use strict';

var _ = require('underscore');


function daysDiff(date) {
    var now = new Date();
    var diff = now.getTime() - date.getTime();
    return Math.abs(Math.round(diff / (60 * 60 * 24)));
}

var analyticsParams = {
    category: {
        name: 'category-name',
        nameParentNameSubName: '[category-name]/[subcategory-name]',
        nameParentNameSubId: '[category-name]/[subcategory-id]',
        nameParentName: '[category-name]',
        nameSubName: '[subcategory-name]',
        nameSubId: '[subcategory-id]',
        parse: function (url, options) {
            if (options.category && options.subcategory) {
                url = url.replace(this.nameParentName, options.category.name);
                url = url.replace(this.nameSubName, options.subcategory.name);
                url = url.replace(this.nameSubId, options.subcategory.id);
            }
            else if (options.category && !options.subcategory) {
                url = url.replace(this.nameParentName, options.category.name);
                url = url.replace(this.nameSubName, 'nocat');
                url = url.replace(this.nameSubId, 'nocat');
            }
            else {
                url = url.replace(this.nameParentNameSubName, 'nocat');
                url = url.replace(this.nameParentNameSubId, 'nocat');
            }
            return url;
        }

    },
    item: {
        name: 'item_attributes',
        parse: function (url, options) {
            var str = [];
            var item = options.item;

            if (item) {
                str.push('img_' + ((item.images && item.images.length) ? '1' : '0'));
                str.push('/source_' + (item.status.feed ? 'f' : 'o'));
                // str.push('/feat_xx')); // Referer (Possible values: home, listingchp, listingexp)

                if (item.status.deprecated) {
                    str.push('/age_expired');
                }
                else if (!item.status.open) {
                    str.push('/age_closed');
                }
                else if (!item.id) {
                    str.push('/age_unavailable');
                }
                else if (daysDiff(new Date(item.date.timestamp)) > 30) {
                    str.push('/age_30');
                }

            }
            return url.replace('[' + this.name + ']', str.join(''));
        }
    },
    filters: {
        name: 'filter_name_value',
        parse: function (url, options) {
            return url.replace('[' + this.name + ']', '');
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
