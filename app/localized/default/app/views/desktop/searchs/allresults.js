'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('searchs/allresults');
var helpers = require('../../../../../../helpers');

module.exports = Base.extend({
    id: 'searchs-allresults-view',
    className: 'searchs-allresults-view',
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

module.exports.id = 'searchs/allresults';
