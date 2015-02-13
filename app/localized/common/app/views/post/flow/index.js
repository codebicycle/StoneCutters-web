'use strict';

var Base = require('../../../bases/view');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'post_flow_index_view',
    id: 'posting-flow',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var languageAbbreviation = this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].isocode.toLowerCase();

        return _.extend({}, data, {
            languageAbbreviation: languageAbbreviation,
            isBangladesh: this.app.session.get('location').url === 'www.olx.com.bd'
        });
    }
});

module.exports.id = 'post/flow/index';
