'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'header-keywords-view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return data;
    }
});

module.exports.id = 'header/keywords';
