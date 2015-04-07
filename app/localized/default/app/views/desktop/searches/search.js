'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('searches/search');
var helpers = require('../../../../../../helpers');
var Metric = require('../../../../../../modules/metric');

module.exports = Base.extend({
    id: 'searches-search-view',
    className: 'searches-search-view',
    tagName: 'main',
    order: ['parentcategory', 'category', 'pricerange', 'carbrand', 'carmodel', 'condition', 'kilometers', 'year', 'bedrooms', 'bathrooms', 'surface', 'state', 'city', 'neighborhood'],
    regexpFindPage: /-p-[0-9]+/,
    regexpReplacePage: /(-p-[0-9]+)/,
    regexpReplaceCategory: /([a-zA-Z0-9-]+-cat-[0-9]+)/,
    regexpFindNeighborhood: /-neighborhood_[0-9_]+/,
    events: {
        'click [data-increment]': 'onClickIncrement'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var link = this.refactorPath(this.app.session.get('path'));

        this.filters = data.filters;
        this.filters.order = this.order;

        return _.extend({}, data, {
            items: data.items,
            nav: {
                link: link,
                linkig: helpers.common.linkig.call(this, link, null, 'searchig'),
                listAct: 'active',
            }
        });
    },
    cleanPage: function(path) {
        if (path.match(this.regexpFindPage)) {
            path = path.replace(this.regexpReplacePage, '');
        }
        return path.replace(/\/\//g, '/');
    },
    refactorPath: function(path) {
        path = this.cleanPage(path);
        path = path.replace(this.regexpFindNeighborhood, '');
        if (path.slice(path.length - 1) === '/') {
            path = path.substring(0, path.length - 1);
        }
        return path;
    },
    onClickIncrement: function(event) {
        var $elem = $(event.currentTarget);

        this.app.session.persist({
            origin: {
                type: 'search',
                isGallery: this.id !== 'searches-search-view',
                isAbundance: !!~($elem.data('increment-value') || '').indexOf('abundance')
            }
        });
        Metric.incrementEventHandler.call(this, event);
    }
});

module.exports.id = 'searches/search';
