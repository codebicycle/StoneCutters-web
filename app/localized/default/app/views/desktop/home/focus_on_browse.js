'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('home/focus_on_browse');
var helpers = require('../../../../../../helpers');
var Metric = require('../../../../../../modules/metric');
var utils = require('../../../../../../../shared/utils');

module.exports = Base.extend({
    tagName: 'main',
    id: 'home_view',
});
