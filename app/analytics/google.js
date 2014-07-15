'use strict';

var _ = require('underscore');
var helpers = require('../helpers');

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

function initParams() {
    var today = new Date().getTime();
    var gaNs = this.app.session.get('gaNs') || 0;

    this.app.session.persist({
        gaIs: today,
        gaPs: today,
        gaCs: today,
        gaNs: ++gaNs,
        gaDh: Math.round(Math.random() * 10000000),
        gaUid: Math.round(Math.random() * 1000000)
    });
}

function persistParams() {
    var gaCs = new Date().getTime();

    this.app.session.persist({
        gaCs: gaCs,
        gaPs: this.app.session.get('gaCs') || gaCs,
        gaIs: this.app.session.get('gaIs') || gaCs,
        gaNs: this.app.session.get('gaNs') || 0,
        gaDh: this.app.session.get('gaDh') || Math.round(Math.random() * 10000000),
        gaUid: this.app.session.get('gaUid') || Math.round(Math.random() * 1000000)
    });
}

function checkInitParams() {
    var gaIs = this.app.session.get('gaIs');
    var gaCs;

    if (!gaIs) {
        initParams.call(this);
        return false;
    }

    gaCs = this.app.session.get('gaCs');
    gaIs = this.app.session.get('gaIs');
    if ((Number(gaCs) - Number(gaIs)) > 1800000) {
        initParams.call(this);
        return false;
    }
    return true;
}

function generate(params, page, options) {
    params.page = generatePage.call(this, page, options);
    if (checkInitParams.call(this)) {
        persistParams.call(this);
    }
}

module.exports = {
    generate: generate
};
