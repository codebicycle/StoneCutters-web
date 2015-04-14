'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('categories/show', null, 'desktop');

module.exports = Base.extend({
    id: 'categories-showig-view',
    className: 'categories-showig-view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var link = this.refactorPath(this.app.session.get('path'));

        delete data.nav.listAct;
        return _.extend({}, data, {
            nav: {
                link: link.replace('-ig', ''),
                linkig: link,
                galeryAct: 'active',
                current: 'showig'
            }
        });
    }
});

module.exports.id = 'categories/showig';
