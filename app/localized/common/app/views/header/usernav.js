'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'header-usernav-view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            user: this.app.session.get('user')
        });
    }
});

module.exports.id = 'header/usernav';
