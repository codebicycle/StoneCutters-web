'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var helpers = require('../../../../../helpers');

module.exports = Base.extend({
    className: 'items_expired_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        data.category_name = this.options.category_name;

        return _.extend({}, data, {
            items: data.relatedItems,
            nav: {
                link: 'nf/all-results',
                linkig: helpers.common.linkig.call(this, 'nf/all-results', null, 'allresultsig'),
                galeryAct: 'active'
            }
        });
    }
});

module.exports.id = 'items/expired';
