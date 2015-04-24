'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var configSurvey = require('../config');
var helpers = require('../../../helpers');
var utils = require('../../../../shared/utils');
var Base;

Backbone.noConflict();
Base = Backbone.Model;

function initialize(attrs, options) {
    this.app = options.app;
}

function isEnabled(options) {
    var enabled = helpers.features.isEnabled.call(this, 'userSurvey');
    var acceptance;
    var dataPage;

    if (enabled) {
        dataPage = this.app.session.get('dataPage');

        if (!dataPage) {
            enabled = false;
        }
        else if (dataPage.search) {
            if (dataPage.category || dataPage.subcategory) {
                acceptance = utils.get(configSurvey, ['searches', dataPage.category], utils.get(configSurvey, ['searches', dataPage.subcategory], []));
            }
            else {
                acceptance = utils.get(configSurvey, ['searches'], {});
                acceptance = _.reduce(acceptance, function each(memo, searches) {
                    return memo.concat(searches);
                }, []);
            }
            enabled = _.contains(acceptance, String(dataPage.search).toLowerCase());
        }
        else {
            acceptance = utils.get(configSurvey, ['categories'], []);
            enabled = _.contains(acceptance, dataPage.category) || _.contains(acceptance, dataPage.subcategory);
        }
    }
    return enabled;
}

module.exports = Base.extend({
    initialize: initialize,
    isEnabled: isEnabled
});
