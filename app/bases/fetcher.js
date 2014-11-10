'use strict';

var _ = require('underscore');
var async = require('async');

module.exports = {
    _retrieve: function(fetchSpecs, options, callback) {
        var batchedRequests = {};

        _.each(fetchSpecs, function each(spec, name) {
            batchedRequests[name] = function request(cb) {
                var modelData, modelOptions;

                if (!options.readFromCache) {
                    this.fetchFromApi(spec, options, cb);
                }
                else {
                    modelData = null;
                    modelOptions = {};
                    if (spec.model) {
                        this._retrieveModel(spec, function(err, modelData) {
                            this._retrieveModelData(spec, modelData, modelOptions, options, cb);
                        }.bind(this));
                    }
                    else if (spec.collection) {
                        this.collectionStore.get(spec.collection, spec.params, function(collection) {
                            if (collection) {
                                modelData = this.retrieveModelsForCollectionName(spec.collection, collection.models.map(function each(model) {
                                    return model.storeKey ? model.storeKey() : model.get(model.idAttribute);
                                }));
                                modelOptions = {
                                    meta: collection.meta,
                                    params: collection.params
                                };
                            }
                            this._retrieveModelData(spec, modelData, modelOptions, options, cb);
                        }.bind(this));
                    }
                }
            }.bind(this);
        }, this);
        async.parallel(batchedRequests, callback);
    },
    getModelForSpec: function(spec, attributes, options, callback) {
        var modelOptions = _.extend(this.buildOptions(options), spec.params);

        attributes = attributes || {};
        _.defaults(attributes, spec.params);
        return this.modelUtils.getModel(spec.model, attributes, modelOptions, callback);
    },
    _retrieveModel: function(spec, callback) {
        var fetcher = this;

        this.modelUtils.modelIdAttribute(spec.model, function(idAttribute) {
            var params = JSON.stringify(_.omit(spec.params, 'app', 'params', 'platform', 'parse', idAttribute));
            var modelData = fetcher.modelStore.get(spec.model, spec.params[idAttribute] + ':' + params);

            callback(null, modelData);
        });
    },
    bootstrapData: function(modelMap) {
        var results = {};
        var fetcher = this;

        async.forEach(_.keys(modelMap), function each(name, cb) {
            var map = modelMap[name];
            var options = _.pick(map.summary, 'params', 'meta');

            options.parse = true;
            fetcher.getModelOrCollectionForSpec(map.summary, map.data, options, function callback(modelOrCollection) {
                results[name] = modelOrCollection;
                cb();
            });
        }, function done(err) {
            fetcher.storeResults(results);
        });
    },
    fetchFromApi: function(spec, options, callback) {
        var model = this.getModelOrCollectionForSpec(spec);
        var fetcher = this;

        model.fetch({
            headers: options.headers || {},
            data: spec.params,
            store: options.store,
            success: function(model, body) {
                callback(null, model);
            },
            error: function(model, resp, options) {
                var body, respOutput, err;

                body = resp.body;
                resp.body = typeof body === 'string' ? body.slice(0, 150) : body;
                respOutput = JSON.stringify(resp);
                err = new Error("ERROR fetching model '" + fetcher.modelUtils.modelName(model.constructor) + "' with options '" + JSON.stringify(options) + "'. Response: " + respOutput);
                err.status = resp.status;
                err.body = body;
                callback(err);
            }
        });
    }
};
