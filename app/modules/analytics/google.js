'use strict';

var _ = require('underscore');
var helpers = require('../../helpers');
var configAnalytics = require('./config');
var config = require('../../../shared/config');
var utils = require('../../../shared/utils');
var SECOND = 1000;
var MINUTE = 60 * SECOND;
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
    return (page.indexOf('/') ? '/' : '') + page + '/';
}

function getId() {
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

    params.page = generatePage.call(this, googlePage, options);
    this.app.session.persist({
        hitCount: Number(this.app.session.get('hitCount') || 0) + 1
    }, {
        maxAge: 30 * MINUTE
    });
}

function generateUrl(options) {
    var url = 'http://www.google-analytics.com/collect';
    var params = {
        v: '1',
        tid: options.id,
        cid: options.clientId,
        t: 'pageview',
        dh: _.rest(options.host.split('.')).join('.'),
        dp: options.page,
        dr: options.referer,
        ul: options.language
    };

    if (options.ip) {
        params.uip = options.ip;
    }
    if (options.hitCount) {
        params._s = options.hitCount;
    }
    params.z = Math.round(Math.random() * 1000000);
    return {
        url: url,
        params: params
    };
}

module.exports = {
    getId: getId,
    generate: generate,
    generateUrl: generateUrl
};
