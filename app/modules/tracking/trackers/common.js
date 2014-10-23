'use strict';

var _ = require('underscore');
var configTracking = require('../config');
var utils = require('../../../../shared/utils');

var pageNameParsers = {
    category: {
        name: 'category-name',
        nameParentNameSubId: '[category-name]/[subcategory-id]',
        nameParentName: '[category-name]',
        nameSubId: '[subcategory-id]',
        parse: function (url, options) {
            if (options.category && options.subcategory) {
                url = url.replace(this.nameParentName, standarizeName(options.category.name));
                url = url.replace(this.nameSubId, options.subcategory.id);
            }
            else if (options.category && !options.subcategory) {
                url = url.replace(this.nameParentNameSubId, standarizeName(options.category.name));
                url = url.replace(this.nameParentName, standarizeName(options.category.name));
            }
            else {
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
                str.push('-feat_0'); // Referer (Possible values: home, listingchp, listingexp)
                str.push('-source_' + (item.status.feed ? 'f' : 'o'));

                if (item.status.deprecated) {
                    str.push('-age_expired');
                }
                else if (!item.status.open) {
                    str.push('-age_closed');
                }
                else if (!item.id) {
                    str.push('-age_unavailable');
                }
                else if (utils.daysDiff(new Date(item.date.timestamp)) > 30) {
                    str.push('-age_30');
                }
            }
            return url.replace('[' + this.name + ']', str.join(''));
        }
    },
    filters: {
        name: 'filter_name_value',
        parse: function (url, options) {
            return url.replace('/[' + this.name + ']', '');
        }
    },
    platform: {
        name: 'rendering',
        parse: function (url, options) {
            return url.replace('[' + this.name + ']', options.rendering);
        }
    }
};

function standarizeName(name) {
    name = name.toLowerCase();
    name = name.replace(/-/g, '');
    name = name.replace(/\s\s/g, ' ');
    name = name.replace(/\s/g, '-');
    name = name.replace(/\//g, '-');
    return name;
}

function getPageName(page, options) {
    var pageName = utils.get(configTracking, ['common', 'pages', page], '');
    var token;

    if (!pageName) {
        return;
    }

    _.each(pageNameParsers, function(parser) {
        token = '[' + parser.name + ']';
        if (~pageName.indexOf(token)) {
            pageName = parser.parse(pageName, options);
        }
    });
    return pageName;
}

module.exports = {
    getPageName: getPageName
};