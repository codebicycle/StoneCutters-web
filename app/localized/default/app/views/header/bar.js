'use strict';

var Base = require('../../../../common/app/bases/view');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'header_bar_view',
    wapAttributes: {
        bgcolor: '#333333'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            blackBar: this.app.session.get('blackBar')
        });
    }
});

module.exports.id = 'header/bar';
