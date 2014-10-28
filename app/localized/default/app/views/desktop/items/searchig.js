'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('items/search', null, 'desktop');
var _ = require('underscore');

module.exports = Base.extend({
    id: 'items-searchig-view',
    className: 'items-searchig-view',
    regexpFindGallery: /-ig/,
    regexpReplaceGallery: /(-ig)/,

    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var linkig = this.app.session.get('path');
        var link = linkig.replace('-ig', '');

        delete data.nav.listAct;
        return _.extend({}, data, {
            nav: {
                link: link,
                linkig: linkig,
                galeryAct: 'active',
                current: 'searchig'
            }
        });
    },
    refactorPath: function(path) {
        var isGallery = '';

        path = Base.prototype.refactorPath.call(this, path);
        if (path.match(this.regexpFindGallery)) {
            isGallery = path.match(this.regexpFindGallery).shift();
            path = path.replace(this.regexpReplaceGallery, '');
        }
        return path.replace(this.regexpReplaceCategory, '$1' + isGallery);
    },
    cleanPath: function(path) {
        var isGallery = '';

        path = Base.prototype.cleanPath.call(this, path);
        if (path.match(this.regexpFindGallery)) {
            isGallery = path.match(this.regexpFindGallery).shift();
            path = path.replace(this.regexpReplaceGallery, '');
        }
        path = path.replace(this.regexpReplaceCategory, 'search');

        if (path.slice(path.length - 1) !== '/') {
            path += '/';
        }
        path += isGallery;
        return path;
    }
});

module.exports.id = 'items/searchig';
