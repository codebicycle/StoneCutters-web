'use strict';

var _ = require('underscore');
var config = require('../../shared/config');
var configAnalytics = require('./config');
var helpers = require('../helpers');
var utils = require('../../shared/utils');
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

function saveParams(utmcc) {
    this.app.session.persist({
        _gaUtmcc: [utmcc.domainHash, utmcc.userId, utmcc.initialSession, utmcc.previousSession, utmcc.currentSession, utmcc.numberSessions].join('.')
    }, {
        maxAge: 30 * MINUTE
    });
}

function parseParams(utmcc) {
    utmcc = utmcc.split('.');

    return {
        domainHash: utmcc[0],
        userId: utmcc[1],
        initialSession: utmcc[2],
        previousSession: utmcc[3],
        currentSession: utmcc[4],
        numberSessions: utmcc[5]
    };
}

function initParams(hash) {
    var today = new Date().getTime();

    saveParams.call(this, {
        domainHash: Math.round(Math.random() * 1000000000),
        userId: Math.round(Math.random() * 1000000000),
        initialSession: today,
        previousSession: today,
        currentSession: today,
        numberSessions: 1
    });
}

function updateParams() {
    var today = new Date().getTime();
    var utmcc = this.app.session.get('_gaUtmcc');

    utmcc = parseParams(utmcc);
    saveParams.call(this, {
        domainHash: utmcc.domainHash,
        userId: utmcc.userId,
        initialSession: utmcc.initialSession,
        previousSession: utmcc.currentSession,
        currentSession: today,
        numberSessions: 1
    });
}

function checkParams() {
    var utmcc = this.app.session.get('_gaUtmcc');

    if (!utmcc) {
        initParams.call(this);
        return false;
    }

    utmcc = parseParams(utmcc);
    if ((Number(utmcc.currentSession) - Number(utmcc.initialSession)) > (30 * MINUTE)) {
        initParams.call(this);
        return false;
    }
    return true;
}

function getUtmcc(app) {
    var utmcc = app.session.get('_gaUtmcc');
    var utmccOut = [];

    utmcc = parseParams(utmcc);
    utmccOut.push('__utma=');
    utmccOut.push(utmcc.domainHash);
    utmccOut.push('.');
    utmccOut.push(utmcc.userId);
    utmccOut.push('.');
    utmccOut.push(utmcc.initialSession);
    utmccOut.push('.');
    utmccOut.push(utmcc.previousSession);
    utmccOut.push('.');
    utmccOut.push(utmcc.currentSession);
    utmccOut.push('.');
    utmccOut.push(utmcc.numberSessions);
    utmccOut.push(';+__utmz=');
    utmccOut.push(utmcc.domainHash);
    utmccOut.push('.');
    utmccOut.push(utmcc.currentSession);
    utmccOut.push('.');
    utmccOut.push(utmcc.numberSessions);
    utmccOut.push('.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none);');
    return utmccOut.join('');
}

function generate(params, page, options) {
    var googlePage = utils.get(configAnalytics, ['google', 'pages', page], '');

    params.page = generatePage.call(this, googlePage, options);
    this.app.session.persist({
        hitCount: Number(this.app.session.get('hitCount') || 0) + 1
    }, {
        maxAge: 30 * MINUTE
    });
    if (checkParams.call(this)) {
        updateParams.call(this);
    }
}

module.exports = {
    getId: getId,
    getUtmcc: getUtmcc,
    generate: generate
};
