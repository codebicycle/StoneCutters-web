'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var breadcrumb = require('../../../../../modules/breadcrumb');
var Sixpack = require('../../../../../../shared/sixpack');
var restler = require('restler');

module.exports = Base.extend({
    className: 'pages_comingsoon_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        var clicked = this.app.session.get('isShopExperimented');
        var sixpack = new Sixpack({
            clientId: this.app.session.get('clientId'),
            platform: this.app.session.get('platform'),
            market: this.app.session.get('location').abbreviation,
            experiments: this.app.session.get('experiments')
        });
        var experiment = sixpack.experiments.html4ShowShops;
        
        if ( experiment ) {
            if (( experiment.firstClick && !clicked ) || !experiment.firstClick ) {

                sixpack.convert(experiment);

                this.app.session.persist({
                    isShopExperimented: true
                });
            }

            restler.postJson('http://localhost:3500/track/experiment', {
                alternative: experiment.alternative,
                clientId: sixpack.clientId,
                from: 'shop' 
            })
            .on('success', function onSuccess(data, response) {
                console.log('success');
            })
            .on('fail', function onFail(err, response) {
                console.log('fail', err);
            });           
        }
        
        return _.extend({}, data, {
            breadcrumb: breadcrumb.get.call(this, data)
        });
    }
});

module.exports.id = 'pages/comingsoon';
