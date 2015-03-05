'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('searches/search');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');
var Shops = require('../../../../../../modules/shops');

module.exports = Base.extend({
    className: 'items_search_view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var alternative = new Shops(this).getAlternativeName();
        
        return _.extend({}, data, {
            shopsAlternative: alternative
        });
    }
});

module.exports.id = 'searches/search';
