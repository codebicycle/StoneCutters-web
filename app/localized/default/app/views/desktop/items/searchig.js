'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('items/search', null, 'desktop');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');

module.exports = Base.extend({
    id: 'items-searchig-view',
    className: 'items-searchig-view',
    regexpFindGallery: /-ig/,
    regexpReplaceGallery: /(-ig)/,
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var link = this.cleanPage(this.app.session.get('path'));

        delete data.nav.listAct;
        return _.extend({}, data, {
            nav: {
                link: link.replace('-ig', ''),
                linkig: link,
                galeryAct: 'active',
                current: 'searchig'
            }
        });
    },
    refactorPath: function(path) {
        var gallery = '';

        path = Base.prototype.refactorPath.call(this, path);
        if (path.match(this.regexpFindGallery)) {
            gallery = path.match(this.regexpFindGallery).shift();
            path = path.replace(this.regexpReplaceGallery, '');
        }
        if (gallery) {
            path = helpers.common.linkig.call(this, path, null, 'searchig');
        }
        return path;
    },
    cleanPath: function(path) {
        var gallery = '';

        path = Base.prototype.cleanPath.call(this, path);
        if (path.match(this.regexpFindGallery)) {
            gallery = path.match(this.regexpFindGallery).shift();
            path = path.replace(this.regexpReplaceGallery, '');
        }
        if (gallery) {
            path = helpers.common.linkig.call(this, path, null, 'searchig');
        }
        return path;
    }
});

module.exports.id = 'items/searchig';
