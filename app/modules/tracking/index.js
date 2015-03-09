'use strict';

var _ = require('underscore');
var analytics = require('./trackers/analytics');
var ati = require('./trackers/ati');
var Tracking = require('./models/tracking');

_.extend(Tracking, {
    ati: ati,
    analytics: analytics
});

module.exports = Tracking;
