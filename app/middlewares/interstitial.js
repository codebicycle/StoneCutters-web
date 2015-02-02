'use strict';

var _ = require('underscore');
var helpers = require('../helpers');
var config = require('../../shared/config');
var utils = require('../../shared/utils');
var Sixpack = require('../../shared/sixpack');
var enabled = config.get(['interstitial', 'enabled'], false);

module.exports = function(params, next) {
    if (!enabled) {
        return next();
    }
    var locationUrl = this.app.session.get('location').url;
    if (_.contains(['www.olx.ir', 'www.olx.com.bd', 'www.olx.com.mx', 'www.olx.cl'], locationUrl)) {
        return next();
    }
    if (locationUrl === 'www.olx.co.za' && this.app.session.get('internet.org')) {
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
            var sixpack = new Sixpack({
                platform: platform,
                market: this.app.session.get('location').abbreviation,
                experiments: this.app.session.get('experiments')
            });

            if (platform === 'html5' && sixpack.experiments.html5Interstitial && sixpack.experiments.html5Interstitial.alternative && sixpack.experiments.html5Interstitial.alternative === 'off') {
                return next();
            }
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
