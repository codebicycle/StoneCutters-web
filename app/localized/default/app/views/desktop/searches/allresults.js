'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('searches/allresults');
var helpers = require('../../../../../../helpers');

module.exports = Base.extend({
    id: 'searches-allresults-view',
    className: 'searches-allresults-view',
    tagName: 'main',
    order: ['state', 'city', 'neighborhood'],
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

module.exports.id = 'searches/allresults';
