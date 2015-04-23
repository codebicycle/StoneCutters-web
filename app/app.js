'use strict';

var _ = require('underscore');
var Base = require('rendr/shared/app');
var Session = require('../shared/session');
var utils = require('../shared/utils');
var Sixpack = require('../shared/sixpack');
var Fetcher = require('./bases/fetcher');
var ModelStore = require('./bases/modelStore');
var CollectionStore = require('./bases/collectionStore');
var nunjucks = require('./modules/nunjucks');
var Seo = require('./modules/seo');
var helpers = require('./helpers');
var Localstorage = require('./modules/localstorage');

module.exports = Base.extend({
    defaults: {
        templateAdapter: 'rendr-nunjucks'
    },
    initialize: function() {
        Session.call(this, true);
        this.seo = new Seo({}, {
            app: this
        });
        _.extend(this.fetcher, Fetcher);
        _.extend(this.fetcher.modelStore, ModelStore);
        _.extend(this.fetcher.collectionStore, CollectionStore);
        this.templateAdapter.registerHelpers(nunjucks.helpers);
        this.templateAdapter.registerExtensions(nunjucks.extensions);
    },
    start: function() {
        if (!utils.isServer) {
            this.localstorage = new Localstorage({}, {
                app: this
            });
            this.sixpack = this.sixpack || new Sixpack({
                clientId: this.session.get('clientId'),
                ip: this.session.get('ip'),
                userAgent: this.session.get('userAgent'),
                platform: this.session.get('platform'),
                market: this.session.get('location').abbreviation,
                experiments: this.session.get('experiments')
            });
        }
        this.router.on('action:start', function onStart() {
            this.set({
                loading: true
            });
            if (this.router.currentView) {
                this.router.currentView.onActionEnd();
            }
        }, this);
        this.router.on('action:end', function onEnd() {
            this.set({
                loading: false
            });
            this.router.currentView.onActionStart();
        }, this);
        this.autolocate();
        Base.prototype.start.call(this);
    },
    getAppViewClass: function() {
        return require('./localized/common/app/views/app');
    },
    fetchDependencies: function(dependencies, cache, callback) {
        if (!dependencies) {
            dependencies = [];
        }
        else if (!Array.isArray(dependencies)) {
            dependencies = [dependencies];
        }
        if (!callback) {
            callback = cache;
            cache = true;
        }
        callback = callback.errfcb ? callback.errfcb : callback;
        if (this.dependencies) {
            return callback(null, this.dependencies);
        }
        this.fetch(this.getSpecs(dependencies), {
            readFromCache: !!cache,
            writeToCache: true,
            store: true
        }, function done(err, response) {
            if (err) {
                return callback(err);
            }
            response.toJSON = toJSON;
            this.dependencies = response;
            callback(null, response);
        }.bind(this));
    },
    getSpecs: function(dependencies) {
        var specs = {};
        var languageId = this.session.get('languages')._byId[this.session.get('selectedLanguage')].id;
        var location = this.session.get('location').url;
        var siteLocation = this.session.get('siteLocation');

        dependencies.forEach(function each(dependency) {
            switch (dependency) {
                case 'categories':
                    specs[dependency] = {
                        collection: 'Categories',
                        params: {
                            location: siteLocation || location,
                            languageId: languageId,
                            seo: Seo.isEnabled(location)
                        }
                    };
                break;
                case 'countries':
                    specs[dependency] = {
                        collection: 'Countries',
                        params: {
                            languageId: languageId
                        }
                    };
                break;
                case 'states':
                    specs[dependency] = {
                        collection: 'States',
                        params: {
                            location: location,
                            languageId: languageId
                        }
                    };
                break;
                case 'topCities':
                    specs[dependency] = {
                        collection: 'Cities',
                        params: {
                            level: 'countries',
                            type: 'topcities',
                            location: location,
                            languageId: languageId
                        }
                    };
                break;
            }
        }, this);
        return specs;
    },
    autolocate: function() {
        if (!navigator || !navigator.geolocation || !helpers.features.isEnabled('autoLocation', this.session.get('platform'), this.session.get('location').url)) {
            return;
        }
        navigator.geolocation.getCurrentPosition(this.onAutolocationSuccess.bind(this), utils.noop, {
            maximumAge: 0,
            timeout: 6000
        });
    },
    onAutolocationSuccess: function(position) {
        this.set('autolocation', position);
    }
});

function toJSON() {
    var json = {};

    Object.keys(_.omit(this, 'toJSON')).forEach(function each(key) {
        json[key] = this[key].toJSON();
    }, this);
    return json;
}
