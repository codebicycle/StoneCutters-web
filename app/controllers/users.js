'use strict';

var _ = require('underscore');
var helpers = require('../helpers');
var config = require('../config');

module.exports = {
    register: function(params, callback) {
        helpers.controllers.control.call(this, params, {
            isForm: true
        }, controller);

        function controller(form) {
            var platform = this.app.session.get('platform');
            var user;

            if (platform === 'wap') {
                return helpers.common.redirect.call(this, '/');
            }
            user = this.app.session.get('user');
            if (user) {
                return helpers.common.redirect.call(this, '/', null, {
                    status: 302
                });
            }
            callback(null, {
                form: form,
                agreeTerms: params.agreeTerms
            });
        }
    },
    login: function(params, callback) {
        helpers.controllers.control.call(this, params, {
            isForm: true
        }, controller);

        function controller(form) {
            var platform = this.app.session.get('platform');
            var user;

            if (platform === 'wap') {
                return helpers.common.redirect.call(this, '/');
            }
            user = this.app.session.get('user');
            if (user) {
                return helpers.common.redirect.call(this, '/', null, {
                    status: 302
                });
            }
            callback(null, {
                form: form,
                redirect: params.redirect
            });
        }
    },
    logout: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            this.app.session.clear('user');
            return helpers.common.redirect.call(this, '/', null, {
                status: 302,
                pushState: false
            });
        }
    },
    myolx: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            var platform = this.app.session.get('platform');
            var user;

            if (platform === 'wap') {
                return helpers.common.redirect.call(this, '/');
            }
            user = this.app.session.get('user');
            if (platform === 'html5' && user) {
                return helpers.common.redirect.call(this, '/', null, {
                    status: 302
                });
            }
            if (!user) {
                return helpers.common.redirect.call(this, '/login', null, {
                    status: 302
                });
            }
            callback(null, {});
        }
    },
    myads: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            var platform = this.app.session.get('platform');
            var user;
            var spec;

            if (platform === 'wap') {
                return helpers.common.redirect.call(this, '/');
            }
            user = this.app.session.get('user');
            if (!user) {
                return helpers.common.redirect.call(this, '/login', null, {
                    status: 302
                });
            }
            spec = {
                myAds: {
                    collection: 'Items',
                    params: {
                        token: user.token,
                        userId: user.userId
                    }
                }
            };
            _.extend(spec.myAds.params, params, {
                location: this.app.session.get('siteLocation'),
                item_type: 'myAds'
            });
            this.app.fetch(spec, {
                readFromCache: false
            }, function afterFetch(err, result) {
                if (err || !result.myAds) {
                    return helpers.common.error.call(this, err, result, callback);
                }
                result.myAdsMetadata = result.myAds.metadata;
                result.myAds = result.myAds.toJSON();
                result.deleted = params.deleted;
                _.each(result.myAds, function processItem(item) {
                    item.date.since = helpers.timeAgo(item.date);
                });
                callback(err, result);
            }.bind(this));
        }
    },
    favorites: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller(form) {
            var platform = this.app.session.get('platform');
            var user;
            var favorite;
            var spec;

            if (platform === 'wap') {
                return helpers.common.redirect.call(this, '/');
            }
            user = this.app.session.get('user');
            if (!user) {
                return helpers.common.redirect.call(this, '/login', null, {
                    status: 302
                });
            }
            spec = {
                favorites: {
                    collection: 'Items',
                    params: {
                        token: user.token,
                        userId: user.userId
                    }
                }
            };
            favorite = params.favorite;
            delete params.favorite;
            _.extend(spec.favorites.params, params, {
                location: this.app.session.get('siteLocation'),
                item_type: 'favorites'
            });
            this.app.fetch(spec, {
                readFromCache: false
            }, function afterFetch(err, result) {
                if (err || !result.favorites) {
                    return helpers.common.error.call(this, err, result, callback);
                }
                result.favoritesMetadata = result.favorites.metadata;
                result.favorites = result.favorites.toJSON();
                result.favorite = favorite;
                _.each(result.favorites, function processItem(item) {
                    item.date.since = helpers.timeAgo(item.date);
                });
                callback(err, result);
            }.bind(this));
        }
    }
};
