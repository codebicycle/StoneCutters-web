'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('categories/show');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');

module.exports = Base.extend({
    id: 'categories-show-view',
    className: 'categories-show-view',
    tagName: 'main',
    order: ['pricerange', 'carbrand', 'condition', 'kilometers', 'year', 'bedrooms', 'bathrooms', 'surface', 'state', 'city'],
    regexpFindPage: /-p-[0-9]+/,
    regexpReplacePage: /(-p-[0-9]+)/,
    events: {
        'keydown .range input': 'onlyNumbers'
    },

    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var link = this.cleanPage(this.app.session.get('path'));
        var platform = this.app.session.get('platform');
        var location = this.app.session.get('location');
        var showAdSenseListingBottom = helpers.features.isEnabled.call(this, 'adSenseListingBottom', platform, location.url);
        var showAdSenseListingTop = helpers.features.isEnabled.call(this, 'adSenseListingTop', platform, location.url);

        this.filters = data.filters;
        this.filters.order = this.order;

        return _.extend({}, data, {
            items: data.items,
            showAdSenseListingBottom: showAdSenseListingBottom,
            showAdSenseListingTop: showAdSenseListingTop,
            nav: {
                link: link,
                linkig: helpers.common.linkig.call(this, link, null, 'showig'),
                listAct: 'active'
            }
        });
    },
    cleanPage: function(path) {
        if (path.match(this.regexpFindPage)) {
            path = path.replace(this.regexpReplacePage, '');
        }
        return path;
    },
    onlyNumbers: function(event) {
        if ($.inArray(event.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 || (event.keyCode == 65 && event.ctrlKey === true) || (event.keyCode >= 35 && event.keyCode <= 39)) {
            return;
        }
        if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && (event.keyCode < 96 || event.keyCode > 105)) {
            event.preventDefault();
        }
    }
});
