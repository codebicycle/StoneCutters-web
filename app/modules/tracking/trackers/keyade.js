'use strict';

var _ = require('underscore');
var configTracking = require('../config');
var utils = require('../../../../shared/utils');
var keyades = utils.get(configTracking, ['keyade', 'countries'], []);

var baseUrl = 'http://k.keyade.com/kaev/1/?kaPcId=98678';
var generators = {
    'items#success': function generate() {
        var replyId = this.app.session.get('replyId');

        this.app.session.clear('replyId');
        return [baseUrl, '&kaEvId=69473&kaEvAcId=3&kaEvMcId=', replyId, '&kaEvCt1=1'].join('');
    },
    'post#success': function generate() {
        var itemId = this.app.session.get('itemId');
        
        this.app.session.clear('itemId');
        return [baseUrl, '&kaEvId=69472&kaEvAcId=2&kaEvMcId=', itemId, '&kaEvCt1=1'].join('');
    }
};

function check() {
    var location = this.app.session.get('location');
    var enabled = config.getForMarket(location.url, ['tracking', 'trackers', 'keyade'], true);

    if (!enabled) {
        return false;
    }
    return _.contains(keyades, location.url);
}

function pageview(page) {
    var generator = utils.get(generators, page);

    if (generator && _.isFunction(generator)) {
        return generator.call(this);
    }
}

module.exports = {
    check: check,
    pageview: pageview
};
