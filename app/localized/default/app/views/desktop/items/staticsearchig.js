'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('items/staticsearch', null, 'desktop');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');

module.exports = Base.extend({
    id: 'items-staticsearchig-view',
    className: 'items-staticsearchig-view',
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
                current: 'qig'
            }
        });
    },
    refactorPath: function(path) {
        var gallery = '';

        if (path.match(this.regexpFindGallery)) {
            gallery = path.match(this.regexpFindGallery).shift();
            path = path.replace(this.regexpReplaceGallery, '');
        }
        path = Base.prototype.refactorPath.call(this, path);
        if (gallery) {
            path = helpers.common.linkig.call(this, path, null, 'qig');
        }
        return path;
    },
    cleanPath: function(path) {
        var gallery = '';

        if (path.match(this.regexpFindGallery)) {
            gallery = path.match(this.regexpFindGallery).shift();
            path = path.replace(this.regexpReplaceGallery, '');
        }
        path = Base.prototype.cleanPath.call(this, path);
        if (gallery) {
            path = helpers.common.linkig.call(this, path, null, 'qig');
        }
        return path;
    }
});

module.exports.id = 'items/staticsearchig';
