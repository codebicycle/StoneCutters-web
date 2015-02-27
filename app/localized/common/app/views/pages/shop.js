'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var breadcrumb = require('../../../../../modules/breadcrumb');
var Sixpack = require('../../../../../../shared/sixpack');

module.exports = Base.extend({
    className: 'pages_comingsoon_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var sixpack = new Sixpack({
            clientId: this.app.session.get('clientId'),
            platform: this.app.session.get('platform'),
            market: this.app.session.get('location').abbreviation,
            experiments: this.app.session.get('experiments')
        });

        sixpack.convert(sixpack.experiments.html4ShowShops);
        
        return _.extend({}, data, {
            breadcrumb: breadcrumb.get.call(this, data)
        });
    }
});

module.exports.id = 'pages/comingsoon';
