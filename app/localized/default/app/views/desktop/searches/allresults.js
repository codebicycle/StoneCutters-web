'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('searches/allresults');
var helpers = require('../../../../../../helpers');
var Metric = require('../../../../../../modules/metric');

module.exports = Base.extend({
    id: 'searches-allresults-view',
    className: 'searches-allresults-view',
    tagName: 'main',
    order: ['pricerange', 'carbrand', 'carmodel', 'state', 'city', 'neighborhood'],
    regexpFindPage: /-p-[0-9]+/,
    regexpReplacePage: /(-p-[0-9]+)/,
    events: {
        'click [data-increment-metric]': 'onClickIncrement'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var link = 'nf/all-results';
        var dgdOpenItemInNewTab = this.app.sixpack.experiments.dgdOpenItemInNewTab;

        return _.extend({}, data, {
            nav: {
                link: link,
                linkig: helpers.common.linkig.call(this, link, null, 'allresultsig'),
                listAct: 'active'
            },
            isABTestOpenNewTabEnabled: dgdOpenItemInNewTab,
            shouldOpenInNewTab: dgdOpenItemInNewTab && dgdOpenItemInNewTab.alternative === 'open-item-in-new-tab'
        });
    },
    postRender: function() {
        this.app.sixpack.convert(this.app.sixpack.experiments.dgdHomePage, 'funnel-browse-listing');
    },
    onClickIncrement: function(event) {
        var $elem = $(event.currentTarget);
        var values = Metric.getValues($elem.data('increment-metric'));

        this.app.session.persist({
            origin: {
                type: 'browse',
                isGallery: this.id !== 'searches-allresults-view',
                isAbundance: !!~(values.value || '').indexOf('abundance')
            }
        });
        Metric.incrementEventHandler.call(this, event);
    }
});

module.exports.id = 'searches/allresults';
