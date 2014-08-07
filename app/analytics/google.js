'use strict';

var _ = require('underscore');
var config = require('../config');
var configAnalytics = require('./config');
var helpers = require('../helpers');
var utils = require('../../shared/utils');
var googleId;

var analyticsParams = {
    category: {
        name: 'category-name',
        nameParentNameSubId: '[category-name]/[subcategory-id]',
        nameParentName: '[category-name]',
        nameSubId: '[subcategory-id]',
        parse: function (url, options) {
            if (options.category && options.subcategory) {
                url = url.replace(this.nameParentName, options.category.name);
                url = url.replace(this.nameSubName, options.subcategory.name);
                url = url.replace(this.nameSubId, options.subcategory.id);
            }
            else if (options.category && !options.subcategory) {
                url = url.replace(this.nameParentName, options.category.name);
                url = url.replace(this.nameSubId, 'nocat');
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
                str.push('/source_' + (item.status.feed ? 'f' : 'o'));

                if (item.status.deprecated) {
                    str.push('/age_expired');
                }
                else if (!item.status.open) {
                    str.push('/age_closed');
                }
                else if (!item.id) {
                    str.push('/age_unavailable');
                }
                else if (helpers.common.daysDiff(new Date(item.date.timestamp)) > 30) {
                    str.push('/age_30');
                }

                // str.push('/feat_xx/')); // Referer (Possible values: home, listingchp, listingexp)

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

function generatePage(page, options) {
    var token;

    _.each(analyticsParams, function(analyticParam) {
        token = '[' + analyticParam.name + ']';
        if (~page.indexOf(token)) {
            page = analyticParam.parse(page, options);
        }
    });

    // BEGIN - Check item closed
    if (options && options.item && options.item.purged) {
        page = page.replace('/item/', '/item_closed/');
    }
    // END - Check item closed

    return (page.indexOf('/') ? '/' : '') + page + '/';
}

function getId() {
    if (1 === 1) {
        return 'UA-50718833-1';
    }
    if (googleId) {
        return googleId;
    }
    var env = config.get(['environment', 'type'], 'development');

    googleId = 'MO-50756825-1';
    if (env !== 'development') {
        googleId = utils.get(configAnalytics, ['google', 'id'], googleId);

        if (env !== 'production') {
            googleId = googleId.replace(/(.+)-2/, '$1-4');
        }
    }
    return googleId;
}

function generate(params, page, options) {
    var googlePage = utils.get(configAnalytics, ['google', 'pages', page], '');

    params.id = getId();
    params.page = generatePage.call(this, googlePage, options);
}

module.exports = {
    getId: getId,
    generate: generate
};
