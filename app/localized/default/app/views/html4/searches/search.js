'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('searches/search');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');
var Sixpack = require('../../../../../../../shared/sixpack');

module.exports = Base.extend({
    className: 'items_search_view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var sixpack = new Sixpack({
            clientId: this.app.session.get('clientId'),
            platform: this.app.session.get('platform'),
            market: this.app.session.get('location').abbreviation,
            experiments: this.app.session.get('experiments')
        });
        var experiment = sixpack.experiments.html4ShowShops;
        console.log('search viewhtml4', experiment);
 
        return _.extend({}, data, {
            experiment: experiment.alternative
        });
    }
});

module.exports.id = 'searches/search';
