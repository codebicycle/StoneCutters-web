'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('categories/show', null, 'desktop');

module.exports = Base.extend({
    id: 'categories-showig-view',
    className: 'categories-showig-view',
    events: _.extend({}, Base.prototype.events, {
        'click a[data-register-click]': 'onClickItem'
    }),
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var link = this.refactorPath(this.app.session.get('path'));

        delete data.nav.listAct;
        return _.extend({}, data, {
            isItemAlternativeInfoEnabled: this.isItemAlternativeInfoEnabled(link),
            nav: {
                link: link.replace('-ig', ''),
                linkig: link,
                galeryAct: 'active',
                current: 'showig'
            },
            shouldOpenInNewTab: this.app.sixpack.experiments.dgdOpenItemInNewTab && this.app.sixpack.experiments.dgdOpenItemInNewTab.alternative === 'open-item-in-new-tab'
        });
    },
    isItemAlternativeInfoEnabled: function(path) {
        var experiment = this.app.sixpack.experiments.dgdCategoryCars;

        return (experiment && experiment.alternative && experiment.alternative === 'gallery' && this.isCategoryCars(path));
    },
    isCategoryCars: function(url) {
        return _.contains([378], Number((url.match(/.+-cat-(\d+).*/) || [])[1] || 0));
    },
    onClickItem: function(event) {
        this.app.sixpack.convert(this.app.sixpack.experiments.dgdCategoryCars, 'item-view');
    }
});

module.exports.id = 'categories/showig';
