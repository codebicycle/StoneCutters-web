'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('header/keywords');
var _ = require('underscore');
var Seo = require('../../../../../../modules/seo');

module.exports = Base.extend({
    tagName: 'header',
    id: 'keywords-view',
    className: 'keywords-view',

    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            seo: Seo.instance(this.app)
        });
    }
});
