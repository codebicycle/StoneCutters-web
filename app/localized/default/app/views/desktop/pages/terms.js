'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('pages/terms');
var _ = require('underscore');

module.exports = Base.extend({
    tagName: 'main',
    id: 'pages-terms-view',
    className: 'page-standart',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            requireTracking: true
        });
    }
});
