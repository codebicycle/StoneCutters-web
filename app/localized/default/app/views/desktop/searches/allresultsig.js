'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('searches/allresults', null, 'desktop');

module.exports = Base.extend({
    id: 'searches-allresultsig-view',
    className: 'searches-allresultsig-view',
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
            },
            shouldOpenInNewTab: this.app.sixpack.experiments.dgdOpenItemInNewTab && this.app.sixpack.experiments.dgdOpenItemInNewTab.alternative === 'open-item-in-new-tab'
        });
    }
});

module.exports.id = 'searches/allresultsig';
