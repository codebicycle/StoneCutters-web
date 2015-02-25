'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('searches/allresults');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');
var Sixpack = require('../../../../../../../shared/sixpack');

module.exports = Base.extend({
    className: 'items_allresults_view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var sixpack = new Sixpack({
            clientId: this.app.session.get('sixpackId'),
            platform: this.app.session.get('platform'),
            market: this.app.session.get('location').abbreviation,
            experiments: this.app.session.get('experiments')
        });
        var experiment = sixpack.experiments.html4ShowShops;
        console.log('allresults viewhtml4', experiment);
 
        return _.extend({}, data, {
            experiment: experiment.alternative
        });
    }
});

module.exports.id = 'searches/allresults';
