'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'edit-success',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {});
    }
});

module.exports.id = 'post/editsuccess';