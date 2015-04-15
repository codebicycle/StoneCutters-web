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
            isItemAlternativeInfoEnabled: this.isItemAlternativeInfoEnabled(link),
            nav: {
                link: link.replace('-ig', ''),
                linkig: link,
                galeryAct: 'active',
                current: 'showig'
            }
        });
    },
    isItemAlternativeInfoEnabled: function(path) {
        var experiment = this.app.sixpack.experiments.dgdCategoryCars;

        return (experiment && experiment.alternative && experiment.alternative === 'gallery' && this.isCategoryCars(path));
    },
    isCategoryCars: function(url) {
        return _.contains([378], Number((url.match(/.+-cat-(\d+).*/) || [])[1] || 0));
    }
});

module.exports.id = 'categories/showig';
