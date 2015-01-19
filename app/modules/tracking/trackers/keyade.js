'use strict';

var _ = require('underscore');
var configTracking = require('../config');
var config = require('../../../../shared/config');
var utils = require('../../../../shared/utils');
var keyades = utils.get(configTracking, ['keyade', 'countries'], []);

var baseUrl = 'http://k.keyade.com/kaev/1/?kaPcId=98678';
var generators = {
    'items#success': function generate(options) {
        var replyId = this.app.session.get('replyId');
        var platform = this.app.session.get('platform');
        var countryId = utils.get(configTracking, ['keyade', 'ids', options.page, platform], 3);

        this.app.session.clear('replyId');
        return [baseUrl, '&kaEvId=69473&kaEvAcId=', countryId, '&kaEvMcId=', replyId, '&kaEvCt1=1'].join('');
    },
    'post#success': function generate(options) {
        var itemId = options.item.id;
        var platform = this.app.session.get('platform');
        var countryId = utils.get(configTracking, ['keyade', 'ids', options.page, platform], 2);

        return [baseUrl, '&kaEvId=69472&kaEvAcId=', countryId, '&kaEvMcId=', itemId, '&kaEvCt1=1'].join('');
    }
};

function isPlatformEnabled(platforms) {
    var enabled = true;

    if (platforms && !_.contains(platforms, this.app.session.get('platform'))) {
        enabled = false;
    }
    return enabled;
}

function isEnabled() {
    var location = this.app.session.get('location');
    var enabled = config.getForMarket(location.url, ['tracking', 'trackers', 'keyade', 'enabled'], true);

    if (enabled) {
        enabled = isPlatformEnabled.call(this, config.getForMarket(location.url, ['tracking', 'trackers', 'keyade', 'platforms']));
    }
    if (enabled) {
        enabled = _.contains(keyades, this.app.session.get('location').url);
    }
    return enabled;
}

function pageview(params, options) {
    var generator = utils.get(generators, options.page);

    if (generator && _.isFunction(generator)) {
        return generator.call(this, options);
    }
}

module.exports = {
    isEnabled: isEnabled,
    pageview: pageview
};
