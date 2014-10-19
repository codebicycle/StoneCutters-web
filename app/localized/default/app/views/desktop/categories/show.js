'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    id: 'categories-show-view',
    className: 'categories-show-view',
    tagName: 'main',
    events: {
        'click .check-box input': 'filterCheckbox'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var slugUrl = helpers.common.slugToUrl(data.currentCategory);
        var filters = data.metadata.filters;
        var order = ['pricerange','carbrand','condition','kilometers','sellertype','year'];
        var list = [];

        _.each(order, function(obj, i){
            _.find(filters, function(obj){
                return obj.name == order[i] ? list.push(obj) : false;
            });
        });

        _.each(data.items, this.processItem);
        return _.extend({}, data, {
            items: data.items,
            filters: list,
            nav: {
                link: slugUrl,
                listAct: 'active',
            }
        });
    },
    processItem: function(item) {
        item.date.since = helpers.timeAgo(item.date);
    },
    filterCheckbox: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var filterName = $(event.currentTarget).data('filter');
        var filterValue = $(event.currentTarget).val();
        var newFilter = '-' + filterName + '_' + filterValue;
        var currentUrl = window.location.pathname;
        var catPath = currentUrl.split('/-')[0];
        var filterPath = currentUrl.split('/-')[1];
        var path;
        
        if (currentUrl.indexOf(filterValue) == -1) {
            if(filterPath && filterPath.indexOf(filterName) >= 0) {
                var currentsFilters = filterPath.split('-');
                var newFilter2 = '';
                for (var i = 0; i < currentsFilters.length; i++) {
                    if (currentsFilters[i].indexOf(filterName) >= 0 ){
                        newFilter2 += currentsFilters[i] + 'OR' + filterValue;
                    }else{
                        newFilter2 += newFilter;
                    }
                }
                path = catPath + '/-' + newFilter2;
            } else if (filterPath) {
                currentUrl = catPath + '/-' + filterPath;
                path = currentUrl + newFilter;
            } else {
                path = catPath + '/' + newFilter;
            }

            path = helpers.common.link(path, this.app);

            this.app.router.redirectTo(path);
        }
    }
});

module.exports.id = 'categories/show';
