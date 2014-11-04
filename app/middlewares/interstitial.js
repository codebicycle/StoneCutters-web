'use strict';

var _ = require('underscore');
var helpers = require('../helpers');
var config = require('../../shared/config');
var utils = require('../../shared/utils');
var enabled = config.get(['interstitial', 'enabled'], false);

module.exports = function(params, next) {
    if (!enabled) {
        return next();
    }
    var url = '/interstitial';
    var platform;
    var platforms;
    var path;
    var paths;
    var info;
    var downloadApp;
    var showInterstitial;
    var clicks;
    var currentClicks;

    platform = this.app.session.get('platform');
    platforms = config.get(['interstitial', 'ignorePlatform'], []);
    if (_.contains(platforms, platform)) {
        return next();
    }

    path = this.app.session.get('path');
    paths = config.get(['interstitial', 'ignorePath'], []);
    paths = _.filter(paths, function filterInterstitial(ignorePath) {
        if (_.isString(ignorePath)) {
            return path === ignorePath;
        }
        return ignorePath.test(path);
    });
    if (paths.length) {
        return next();
    }

    if (utils.params(this.app.session.get('url') || '', 'target') === 'posting') {
        return next();
    }

    info = helpers.marketing.getInfo(this.app, 'interstitial');
    if (!info || _.isEmpty(info)) {
        return next();
    }

    downloadApp = this.app.session.get('downloadApp');
    if (downloadApp && downloadApp === '1') {
        return next();
    }

    showInterstitial = this.app.session.get('showInterstitial');
    if (_.isUndefined(showInterstitial) || showInterstitial !== '1') {
        clicks = config.get(['interstitial', 'clicks'], 1);
        currentClicks = this.app.session.get('clicks') || 0;

        if (currentClicks < clicks) {
            currentClicks++;
            this.app.session.persist({
                clicks: currentClicks
            });
        }
        else {
            var protocol = this.app.session.get('protocol');
            var host = this.app.session.get('host');
            var time = config.get(['interstitial', 'time'], 60000);

            this.app.session.clear('clicks');
            this.app.session.persist({
                showInterstitial: time
            });
            if (!this.app.session.get('isServer') || platform === 'html5') {
                this.app.session.update({
                    interstitial: true
                });
            }
            else {
                next.abort();
                return helpers.common.redirect.call(this, [url, '?ref=', protocol, '://', host, this.app.session.get('url')].join(''), null, {
                    status: 302
                });
            }
        }
    }
    return next();
};
