'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('categories/show');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    id: 'categories_showig_view',
    className: 'categories_showig_view',

    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var link = this.refactorPath(this.app.session.get('path'));
        console.log('llega');
        //delete data.nav.listAct;
        return _.extend({}, data, {
            items: data.items,
            nav: {
                link: link,
                linkig: helpers.common.linkig.call(this, link, null, 'showig'),
                listAct: 'active',
                current: 'show'
            },
            filtersEnabled: helpers.features.isEnabled.call(this, 'listingFilters')
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
    }
});

module.exports.id = 'categories/show';
