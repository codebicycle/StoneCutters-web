'use strict';

var uuid = require('node-uuid');
var _ = require('underscore');
var Sixpack = require('../../../shared/sixpack');
var config = require('../../../shared/config');
var Adapter = require('../../../shared/adapters/base');
var utils = require('../../../shared/utils');
var shopHost = config.get(['mario', 'host'], 'mario.apps.olx.com');
var isServer = utils.isServer;

function Shops(options) {
	this.app = options.app;
    this.shopSessionId = this.app.session.get('shopSessionId');
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

	if (experiment && experiment.alternative) {
		return experiment.alternative;
	}
	return '';
};

Shops.prototype.enabled = function() {
	return !!this.getExperiment();
};

Shops.prototype.shouldGetShops = function() {
    var experiment = this.getExperiment();

    return (experiment && experiment.alternative !== 'items');
 };

Shops.prototype.start = function(from, itemsCount, shopsCount) {
    var experiment = this.getExperiment();

    this.shopSessionId = uuid.v4();
    this.app.session.persist({
        shopSessionId: this.shopSessionId
    });

    track.call(this, experiment.alternative, this.sixpack.clientId, { 
        shops_experiment_from: from,
        itemId: itemsCount,
        shopId: shopsCount
    }
    );
};

Shops.prototype.evaluate = function(params) {
	var experiment = this.getExperiment();
	var clicked;

    if (experiment) {
        clicked = this.app.session.get('isShopExperimented');
        if ((experiment.firstClick && !clicked) || !experiment.firstClick) {
			convert(this.sixpack, experiment, params.shops_experiment_from);
            this.app.session.persist({
                isShopExperimented: true
            });
        }
        track.call(this, experiment.alternative, this.sixpack.clientId, params);
	}
};

function convert(sixpack, experiment, from) {

    if (from) {
        if (experiment.alternative === 'items' && (from === 'listing-item-from-image' || from === 'listing-item-from-title')) {
            return sixpack.convert(experiment);
        }

        if (experiment.alternative !== 'items' && from !== 'listing-item-from-image' && from !== 'listing-item-from-title') {
            return sixpack.convert(experiment);
        }
    }
}

function track(alternative, clientId, params) {
    var adapter = new Adapter({});
    
    adapter.request(this.app.req, {
        method: 'GET',
        url: 'http://tracking.olx-st.com/h/minv/',
        query: {
            alternative: alternative,
            clientId: clientId,
            shops_experiment_from: params.shops_experiment_from,
            itemId: params.itemId,
            shopId: params.shopId,
            sessionId: this.shopSessionId,
            t: _.now()
        }
    }, {
        timeout: 500
    }, callback);

    function callback() {
        // Ignore response
    }
}

module.exports = Shops;
