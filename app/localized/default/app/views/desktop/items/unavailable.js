'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('items/unavailable');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');

module.exports = Base.extend({
	tagName: 'aside',
    className: 'items_unavailable_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var link = 'nf/all-results';

        data.category_name = this.options.category_name;
        return _.extend({}, data, {
            items: data.relatedItems,
            nav: {
                link: link,
                linkig: helpers.common.linkig.call(this, link, null, 'allresultsig'),
                galeryAct: 'active'
            }
        });
    }
});

module.exports.id = 'items/unavailable';
