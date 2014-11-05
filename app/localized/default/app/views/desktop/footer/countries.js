'use strict';

var Base = require('../../../../../common/app/bases/view');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'footer-countries-view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            location: this.app.session.get('location')
        });
    }
});

module.exports.id = 'footer/countries';
