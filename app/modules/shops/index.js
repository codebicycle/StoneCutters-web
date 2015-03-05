'use strict';

var Sixpack = require('../../../shared/sixpack');
var config = require('../../../shared/config');
var shopHost = config.get(['mario', 'host'], 'mario.apps.olx.com');
var utils = require('../../../shared/utils');
var isServer = utils.isServer;

if (isServer) {
    var restlerName = 'restler';
    var restler = require(restlerName);
}

module.exports = Shops;

function Shops(options) {

	this.app = options.app;
	this.sixpack = new Sixpack({
        clientId: this.app.session.get('clientId'),
        platform: this.app.session.get('platform'),
        market: this.app.session.get('location').abbreviation,
        experiments: this.app.session.get('experiments')
    });	
	
}

Shops.prototype.getExperiment = function() {
	return this.sixpack.experiments.html4ShowShops;
};

Shops.prototype.getAlternativeName = function() {
	var experiment = this.getExperiment();

	if (experiment.alternative) {
		return experiment.alternative;
	}
	return '';
};

Shops.prototype.enabled = function() {

	if (this.getExperiment()) {
        return true;
    }

    return false;
};

Shops.prototype.evaluate = function(from) {

	var experiment = this.getExperiment();
	if ( experiment ) {

		var clicked = this.app.session.get('isShopExperimented');
        if (( experiment.firstClick && !clicked ) || !experiment.firstClick ) {
			
			convert(this.sixpack, experiment, from);

            this.app.session.persist({
                isShopExperimented: true
            });
        }
        track(experiment.alternative, this.sixpack.clientId, from);
	}
};

function convert(sixpack, experiment, from) {

	if (experiment.alternative == 'items' && !from ){
		return sixpack.convert(experiment);
	}
	if (experiment.alternative != 'items' && from) {
		return sixpack.convert(experiment);
	}
}

function track(alternative, clientId, from) {

	console.log('track', alternative, clientId, from);
    restler.postJson('http://' + shopHost + '/track/experiment', {
        alternative: alternative,
        clientId: clientId,
        from: from 
    })
    .on('success', function onSuccess(data, response) {
        console.log('success');
    })
    .on('fail', function onFail(err, response) {
        console.log('fail', err);
    });
}


