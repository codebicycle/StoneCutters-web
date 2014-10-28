'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('categories/show', null, 'desktop');
var _ = require('underscore');

module.exports = Base.extend({
    id: 'categories-showig-view',
    className: 'categories-showig-view',

    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var link = this.app.session.get('path');

        delete data.nav.listAct;
        return _.extend({}, data, {
            nav: {
                linkig: link,
                link: link.replace('-ig', ''),
                galeryAct: 'active',
                current: 'showig'
            }
        });
    }
});
