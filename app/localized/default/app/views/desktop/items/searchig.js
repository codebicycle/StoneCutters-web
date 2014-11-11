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
    cleanPage: function(path) {
        if (path.match(this.regexpFindPage)) {
            path = path.replace(this.regexpReplacePage, '');
        }
        return path;
    }
});

module.exports.id = 'items/searchig';
