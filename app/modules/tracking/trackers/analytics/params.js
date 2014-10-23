'use strict';

var configTracking = require('../../config');
var config = require('../../../../../shared/config');
var utils = require('../../../../../shared/utils');
var environment = config.get(['environment', 'type'], 'development');
var defaultTracker = utils.get(configTracking, ['analytics', 'trackers', 'default']);
var SECOND = 1000;
var MINUTE = 60 * SECOND;

function getDefaults() {
    var today = new Date().getTime();

    return {
        domainHash: Math.round(Math.random() * 1000000000),
        userId: Math.round(Math.random() * 1000000000),
        initialSession: today,
        previousSession: today,
        currentSession: today,
        numberSessions: 1
    };
}

function init() {
    save.call(this, getDefaults());
}

function save(utmcc) {
    this.app.session.persist({
        _gaUtmcc: [utmcc.domainHash, utmcc.userId, utmcc.initialSession, utmcc.previousSession, utmcc.currentSession, utmcc.numberSessions].join('.')
    }, {
        maxAge: 30 * MINUTE
    });
}

function parse(utmcc) {
    if (!utmcc) {
        return getDefaults();
    }
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

function check() {
    var utmcc = this.app.session.get('_gaUtmcc');

    this.app.session.persist({
        hitCount: Number(this.app.session.get('hitCount') || 0) + 1
    }, {
        maxAge: 30 * MINUTE
    });
    if (!utmcc) {
        init.call(this);
        return false;
    }

    utmcc = parse(utmcc);
    if ((Number(utmcc.currentSession) - Number(utmcc.initialSession)) > (30 * MINUTE)) {
        init.call(this);
        return false;
    }
    return true;
}

function update() {
    var today = new Date().getTime();
    var utmcc = this.app.session.get('_gaUtmcc');

    utmcc = parse(utmcc);
    save.call(this, {
        domainHash: utmcc.domainHash,
        userId: utmcc.userId,
        initialSession: utmcc.initialSession,
        previousSession: utmcc.currentSession,
        currentSession: today,
        numberSessions: 1
    });
}

function getId(siteLocation, platform) {
    var tracker = environment;

    if (platform !== 'desktop') {
        platform = 'default';
    }

    if (tracker === 'production') {
        tracker = siteLocation.split('.');
        tracker[0] = 'www';
        tracker = tracker.join('.');
    }

    return utils.get(configTracking, ['analytics', 'trackers', tracker, platform], defaultTracker[platform]);
}

function getUtmcc() {
    var utmcc = this.app.session.get('_gaUtmcc');
    var utmccOut = [];

    utmcc = parse(utmcc);
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

module.exports = {
    check: check,
    update: update,
    getId: getId,
    getUtmcc: getUtmcc
};
