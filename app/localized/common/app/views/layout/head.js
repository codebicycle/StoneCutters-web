'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var config = require('../../../../../../shared/config');
var Seo = require('../../../../../modules/seo');
var helpers = require('../../../../../helpers');


module.exports = Base.extend({
    className: 'layout_head_view',
    tagName: 'head',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var icons = config.get(['icons', this.app.session.get('platform')], []);
        var country = this.app.session.get('location').url;
        var smartBanner = helpers.features.isEnabled.call(this, 'smartBanner');

        return _.extend({}, data, {
            head: this.app.seo.get('head'),
            clientId: this.app.session.get('clientId'),
            icons: (~icons.indexOf(country) ? country : 'default'),
            smartBanner: smartBanner
        });
    }
});

module.exports.id = 'layout/head';
