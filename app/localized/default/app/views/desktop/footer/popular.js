'use strict';

var Base = require('../../../../../common/app/bases/view');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'footer-popular-view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var topcities = data.topcities;
        console.log(topcities);
        return _.extend({}, data, {
            location: this.app.session.get('location'),
            topcities: topcities
        });
    }
});

module.exports.id = 'footer/popular';
