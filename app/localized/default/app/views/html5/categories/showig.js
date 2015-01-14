'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('categories/show');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'categories_show_view_ig',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var link = this.refactorPath(this.app.session.get('path'));
        console.log(data.items);
        return _.extend({}, data, {
            items: data.items,
            nav: {
                link: link.replace('-ig', ''),
                linkig: link,
                galeryAct: 'active',
                current: 'showig'
            },
            filtersEnabled: helpers.features.isEnabled.call(this, 'listingFilters')

        });
    },
    postRender: function() {
        console.log('postRender IG');
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
    }
});

module.exports.id = 'categories/show';
