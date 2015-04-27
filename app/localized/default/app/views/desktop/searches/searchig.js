'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('searches/search', null, 'desktop');

module.exports = Base.extend({
    id: 'searches-searchig-view',
    className: 'searches-searchig-view',
    regexpFindGallery: /-ig/,
    regexpReplaceGallery: /(-ig)/,
    regexpFindNeighborhood: /-neighborhood_[0-9_]+/,
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var link = this.refactorPath(this.app.session.get('path'));

        delete data.nav.listAct;
        return _.extend({}, data, {
            nav: {
                link: link.replace(/\/?-ig/, ''),
                linkig: link,
                galeryAct: 'active',
                current: 'searchig'
            },
            isABTestOpenNewTabEnabled: this.app.sixpack.experiments.dgdOpenItemInNewTab,
            shouldOpenInNewTab: this.app.sixpack.experiments.dgdOpenItemInNewTab.alternative === 'open-item-in-new-tab'
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

module.exports.id = 'searches/searchig';
