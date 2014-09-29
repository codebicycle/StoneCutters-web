'use strict';

var Base = require('../../../../../common/app/bases/view');
var config = require('../../../../../../../shared/config');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'header_usernav_view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            user: this.app.session.get('user')
        });
    }
});

module.exports.id = 'header/usernav';