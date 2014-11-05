'use strict';

var Base = require('../../../../../common/app/bases/view');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'footer-countries-view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var countries = data.countries;

        return _.extend({}, data, {
            location: this.app.session.get('location'),
            countries: countries
        });
    }
});

module.exports.id = 'footer/countries';
