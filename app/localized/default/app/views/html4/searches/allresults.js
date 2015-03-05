'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('searches/allresults');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'items_allresults_view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var experiment = this.app.session.get('experiments').html4ShowShops;
        var alternative = '';
        
        if (experiment) {
            alternative = experiment.alternative;
        }
 
        return _.extend({}, data, {
            shopsAlternative: alternative
        });
    }
});

module.exports.id = 'searches/allresults';
