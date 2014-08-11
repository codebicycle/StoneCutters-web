'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'locations_select_view',
    wapAttributes: {
        bgcolor: '#DDDDDD'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var heading = (data.url !== '/') ? 3 : 1;

        return _.extend({}, data, {
            heading: heading
        });
    }
});

module.exports.id = 'locations/select';
