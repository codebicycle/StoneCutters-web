'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('items/allresults', null, 'desktop');
var _ = require('underscore');

module.exports = Base.extend({
    id: 'items-allresultsig-view',
    className: 'items-allresultsig-view',

    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        delete data.nav.listAct;
        return _.extend({}, data, {
            nav: {
                link: 'nf/all-results',
                linkig: 'nf/all-results-ig',
                galeryAct: 'active',
                current: 'allresultig'
            }
        });
    }
});

module.exports.id = 'items/allresultsig';
