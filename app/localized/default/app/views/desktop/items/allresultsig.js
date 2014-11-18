'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('items/allresults', null, 'desktop');
var _ = require('underscore');

module.exports = Base.extend({
    id: 'items-allresultsig-view',
    className: 'items-allresultsig-view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var link = 'nf/all-results-ig';

        delete data.nav.listAct;
        return _.extend({}, data, {
            nav: {
                link: link.replace('-ig', ''),
                linkig: link,
                galeryAct: 'active',
                current: 'allresultsig'
            }
        });
    }
});

module.exports.id = 'items/allresultsig';
