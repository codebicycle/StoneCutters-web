'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('items/search');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');

module.exports = Base.extend({
    className: 'items_search_view',
    regexpFindPage: /-p-[0-9]+/,
    regexpReplacePage: /(-p-[0-9]+)/,
    regexpReplaceCategory: /([a-zA-Z0-9-]+-cat-[0-9]+)/,
    regexpFindNeighborhood: /-neighborhood_[0-9_]+/,

    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var link = this.refactorPath(this.app.session.get('path'));

        return _.extend({}, data, {
            nav: {
                linkig: helpers.common.linkig.call(this, link, null, 'searchig'),
                current: 'show'
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
    }
});
