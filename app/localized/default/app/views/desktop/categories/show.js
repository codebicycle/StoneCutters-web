'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    id: 'categories-show-view',
    className: 'categories-show-view',
    tagName: 'main',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var slugUrl = helpers.common.slugToUrl(data.currentCategory);
        var filters = data.metadata.filters;
        var order = ['pricerange','hasimage','state','parentcategory'];
        var list = [];
        console.log(filters);

        _.each(order, function(obj, i){
            _.find(filters, function(obj){
                return obj.name == order[i] ? list.push(obj) : false;
            });
        });

        console.log(list);

        _.each(data.items, this.processItem);
        return _.extend({}, data, {
            items: data.items,
            nav: {
                link: slugUrl,
                listAct: 'active'
            }
        });
    },
    processItem: function(item) {
        item.date.since = helpers.timeAgo(item.date);
    }
});

module.exports.id = 'categories/show';
