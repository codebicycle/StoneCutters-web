'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('items/allresults');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');

module.exports = Base.extend({
    id: 'items-allresults-view',
    className: 'items-allresults-view',
    tagName: 'main',
    order: ['state', 'city'],
    regexpFindPage: /-p-[0-9]+/,
    regexpReplacePage: /(-p-[0-9]+)/,
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var link = 'nf/all-results';

        return _.extend({}, data, {
            nav: {
                link: link,
                linkig: helpers.common.linkig.call(this, link, null, 'allresultsig'),
                listAct: 'active'
            }
        });
    }
});
