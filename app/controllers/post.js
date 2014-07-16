'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var sixpackName = 'sixpack-client';
var sixpack = require(sixpackName);
var helpers = require('../helpers');
var seo = require('../seo');
var analytics = require('../analytics');
var config = require('../config');

module.exports = {
    categories: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            var siteLocation = this.app.session.get('siteLocation');

            if (!siteLocation || siteLocation.indexOf('www.') === 0) {
                return helpers.common.redirect.call(this, '/location?target=posting', null, {
                    status: 302
                });
            }
            this.app.fetch({
                categories: {
                    collection: 'Categories',
                    params: {
                        location: siteLocation,
                        languageCode: this.app.session.get('selectedLanguage')
                    }
                }
            }, {
                readFromCache: false
            }, function afterFetch(err, result) {
                var sixpackConfig = config.get('sixpack', {});

                analytics.reset();
                seo.addMetatag('robots', 'noindex, nofollow');
                seo.addMetatag('googlebot', 'noindex, nofollow');
                seo.update();
                if (!sixpackConfig.enabled ||
                    !sixpackConfig['post-button'] ||
                    !sixpackConfig['post-button'].enabled ||
                    !params.sixpack || params.sixpack !== 'post-button') {
                    return callback(null, {
                        analytics: analytics.generateURL.call(this),
                        categories: result.categories.toJSON()
                    });
                }
                var session = new sixpack.Session(this.app.session.get('clientId'), sixpackConfig.url);

                session.convert('post-button', function(err, res) {
                    callback(null, {
                        analytics: analytics.generateURL.call(this),
                        categories: result.categories.toJSON()
                    });
                });
            }.bind(this));
        }
    },
    subcategories: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            var siteLocation = this.app.session.get('siteLocation');

            if (!siteLocation || siteLocation.indexOf('www.') === 0) {
                return helpers.common.redirect.call(this, '/location?target=posting', null, {
                    status: 302
                });
            }
            this.app.fetch({
                categories: {
                    collection: 'Categories',
                    params: {
                        location: siteLocation,
                        languageCode: this.app.session.get('selectedLanguage')
                    }
                }
            }, {
                readFromCache: false
            }, function afterFetch(err, result) {
                var category = result.categories.get(params.categoryId);

                if (!category) {
                    return helpers.common.redirect.call(this, '/posting');
                }
                analytics.reset();
                seo.addMetatag('robots', 'noindex, nofollow');
                seo.addMetatag('googlebot', 'noindex, nofollow');
                seo.update();
                callback(null, _.extend(params, {
                    category: category.toJSON(),
                    subcategories: category.get('children').toJSON(),
                    analytics: analytics.generateURL.call(this)
                }));
            }.bind(this));
        }
    },
    form: function(params, callback) {
        helpers.controllers.control.call(this, params, {
            isForm: true
        }, controller);

        function controller(form) {
            var siteLocation = this.app.session.get('siteLocation');
            var language;
            var languages;
            var languageId;
            var languageCode;

            if (!siteLocation || siteLocation.indexOf('www.') === 0) {
                return helpers.common.redirect.call(this, '/location?target=posting', null, {
                    status: 302
                });
            }
            language = this.app.session.get('selectedLanguage');
            languages = this.app.session.get('languages');
            languageId = languages._byId[language].id;
            languageCode = languages._byId[language].isocode.toLowerCase();

            function findCategories(done) {
                this.app.fetch({
                    categories: {
                        collection: 'Categories',
                        params: {
                            location: siteLocation,
                            languageCode: language
                        }
                    }
                }, {
                    readFromCache: false
                }, function afterFetch(err, res) {
                    if (err) {
                        return done.fail(err, res);
                    }
                    done(res.categories);
                }.bind(this));
            }

            function findPostingSession(done) {
                this.app.fetch({
                    postingSession: {
                        model: 'PostingSession',
                        params: {}
                    }
                }, {
                    readFromCache: false
                }, function afterFetch(err, res) {
                    if (err) {
                        return done.fail(err, res);
                    }
                    done(res.postingSession.get('postingSession'));
                }.bind(this));
            }

            function findFields(done) {
                this.app.fetch({
                    fields: {
                        collection: 'Fields',
                        params: {
                            intent: 'post',
                            location: siteLocation,
                            categoryId: params.subcategoryId,
                            languageId: languageId,
                            languageCode: languageCode
                        }
                    }
                }, {
                    readFromCache: false
                }, function afterFetch(err, res) {
                    if (err) {
                        return done.fail(err, res);
                    }
                    done(res.fields.models[0].attributes);
                }.bind(this));
            }

            function success(_categories, _postingSession, _fields) {
                if (!_categories || !_postingSession || !_fields) {
                    return helpers.common.error.call(this, null, {}, callback);
                }
                var category = _categories.get(params.categoryId);
                var subcategory;
                
                if (!category) {
                    return helpers.common.redirect.call(this, '/posting');
                }
                subcategory = category.get('children').get(params.subcategoryId);
                if (!subcategory) {
                    return helpers.common.redirect.call(this, '/posting/' + params.categoryId);
                }

                analytics.reset();
                analytics.addParam('category', category.toJSON());
                analytics.addParam('subcategory', subcategory.toJSON());
                seo.addMetatag('robots', 'noindex, nofollow');
                seo.addMetatag('googlebot', 'noindex, nofollow');
                seo.update();
                callback(null, {
                    postingSession: _postingSession,
                    intent: 'create',
                    fields: _fields.fields,
                    category: category.toJSON(),
                    subcategory: subcategory.toJSON(),
                    language: languageId,
                    languageCode: languageCode,
                    siteLocation: siteLocation,
                    form: form,
                    analytics: analytics.generateURL.call(this)
                });
            }

            function error(err, res) {
                return helpers.common.error.call(this, err, res, callback);
            }

            asynquence().or(error.bind(this))
                .gate(findCategories.bind(this), findPostingSession.bind(this), findFields.bind(this))
                .val(success.bind(this));
        }
    },
    success: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            var user = this.app.session.get('user');
            var securityKey = params.sk;
            var itemId = params.itemId;
            var siteLocation = this.app.session.get('siteLocation');
            var anonymousItem;
            
            if (user) {
                params.token = user.token;
            }
            else if (typeof window !== 'undefined' && localStorage) {
                anonymousItem = localStorage.getItem('anonymousItem');
                anonymousItem = (!anonymousItem ? {} : JSON.parse(anonymousItem));
                if (securityKey) {
                    anonymousItem[params.itemId] = securityKey;
                    localStorage.setItem('anonymousItem', JSON.stringify(anonymousItem));
                }
                else {
                    securityKey = anonymousItem[params.itemId];
                }
            }
            params.id = params.itemId;
            delete params.itemId;
            delete params.title;
            delete params.sk;

            function findCategories(done) {
                this.app.fetch({
                    categories: {
                        collection : 'Categories',
                        params: {
                            location: siteLocation,
                            languageCode: this.app.session.get('selectedLanguage')
                        }
                    }
                }, {
                    readFromCache: false
                }, function afterFetch(err, res) {
                    if (err) {
                        return done.fail(err, res);
                    }
                    done(res.categories);
                }.bind(this));
            }

            function findItem(done) {
                this.app.fetch({
                    item: {
                        model: 'Item',
                        params: params
                    }
                }, {
                    readFromCache: false
                }, function afterFetch(err, res) {
                    if (err) {
                        return done.fail(err, res);
                    }
                    done(res.item);
                }.bind(this));
            }

            function findRelatedItems(done, _categories, _item) {
                if (!_categories || !_item) {
                    return helpers.common.error.call(this, null, {}, callback);
                }

                this.app.fetch({
                    relatedItems: {
                        collection : 'Items',
                        params: {
                            location: siteLocation,
                            offset: 0,
                            pageSize: 10,
                            relatedAds: itemId
                        }
                    }
                }, {
                    readFromCache: false
                }, function afterFetch(err, res) {
                    if (err) {
                        err = null;
                        res = {
                            relatedItems: []
                        };
                    }
                    else {
                        res.relatedItems = res.relatedItems.toJSON();
                    }
                    done(_categories, _item, res.relatedItems);
                }.bind(this));
            }

            function success(_categories, _item, _relatedItems) {
                var item = _item.toJSON();
                var subcategory = _categories.search(item.category.id);
                var category = _categories.get(subcategory.get('parentId'));

                analytics.reset();
                analytics.addParam('item', item);
                analytics.addParam('category', category.toJSON());
                analytics.addParam('subcategory', subcategory.toJSON());
                seo.addMetatag('robots', 'noindex, nofollow');
                seo.addMetatag('googlebot', 'noindex, nofollow');
                seo.update();
                callback(err, {
                    user: user,
                    item: item,
                    sk: securityKey,
                    category: category.toJSON(),
                    subcategory: subcategory.toJSON(),
                    relatedItems: _relatedItems,
                    analytics: analytics.generateURL.call(this)
                });
            }

            function error(err, res) {
                return helpers.common.error.call(this, err, res, callback);
            }

            asynquence().or(error.bind(this))
                .gate(findCategories.bind(this), findItem.bind(this))
                .then(findRelatedItems.bind(this))
                .val(success.bind(this));
        }
    },
    edit: function(params, callback) {
        helpers.controllers.control.call(this, params, {
            isForm: true
        }, controller);

        function controller(form) {
            var user = this.app.session.get('user');
            var siteLocation = this.app.session.get('siteLocation');
            var language = this.app.session.get('selectedLanguage');
            var languages = this.app.session.get('languages');
            var languageId = languages._byId[language].id;
            var languageCode = languages._byId[language].isocode.toLowerCase();
            var securityKey = params.sk;
            var _params = {
                id: params.itemId,
                languageId: languageId,
                languageCode: languageCode
            };
            var spec = {
                categories: {
                    collection: 'Categories',
                    params: {
                        location: siteLocation,
                        languageCode: language
                    }
                },
                item: {
                    model: 'Item',
                    params: _params
                }
            };

            if (!user && !securityKey) {
                return helpers.common.redirect.call(this, '/login', null, {
                    status: 302
                });
            }
            checkAuthentication(_params, _params.id);
            this.app.fetch(spec, {
                readFromCache: false
            }, function afterFetch(err, result) {
                if (err) {
                    return helpers.common.redirect.call(this, '/');
                }
                var protocol = this.app.session.get('protocol');
                var platform = this.app.session.get('platform');
                var currentLocation = this.app.session.get('location');
                var location = result.item.get('location');
                var slug;
                var url;

                if (location.url !== currentLocation.url) {
                    url = [protocol, '://', platform, '.', location.url.replace('www.', 'm.'), '/login'].join('');
                    if (location.children) {
                        location = location.children[0];
                        if (location.children) {
                            location = location.children[0];
                        }
                    }
                    return helpers.common.redirect.call(this, url, null, {
                        pushState: false,
                        query: {
                            location: location.url
                        }
                    });
                }
                findFields.call(this, null, result);
            }.bind(this));

            function checkAuthentication(params, id) {
                var anonymousItem;

                if (user) {
                    params.token = user.token;
                }
                else {
                    if (typeof window !== 'undefined' && localStorage) {
                        anonymousItem = localStorage.getItem('anonymousItem');
                        anonymousItem = (!anonymousItem ? {} : JSON.parse(anonymousItem));
                        if (securityKey) {
                            anonymousItem[id] = securityKey;
                            localStorage.setItem('anonymousItem', JSON.stringify(anonymousItem));
                        }
                        else {
                            securityKey = anonymousItem[id];
                        }
                    }
                    params.securityKey = securityKey;
                }
            }

            function findFields(err, response) {
                var item = response.item.toJSON();
                var _params = {
                    intent: 'edit',
                    location: siteLocation,
                    languageId: languageId,
                    languageCode: languageCode,
                    itemId: item.id,
                    categoryId: item.category.id
                };
                var spec = {
                    postingSession: {
                        model: 'PostingSession',
                        params: {}
                    },
                    fields: {
                        collection: 'Fields',
                        params: _params
                    }
                };

                checkAuthentication(_params, _params.itemId);
                this.app.fetch(spec, {
                    readFromCache: false
                }, function afterFetch(err, result) {
                    var subcategory = response.categories.search(item.category.id);
                    var category = response.categories.get(subcategory.get('parentId'));

                    result.item = item;
                    result.user = user;
                    result.postingSession = result.postingSession.get('postingSession');
                    result.intent = 'edit';
                    result.fields = result.fields.models[0].attributes.fields;
                    result.category = category.toJSON();
                    result.subcategory = subcategory.toJSON();
                    result.language = languageId;
                    result.languageCode = languageCode;
                    result.errField = params.errField;
                    result.errMsg = params.errMsg;
                    result.sk = securityKey;
                    if (!form || !form.values) {
                        result.form = {
                            values: item
                        };
                    }
                    else {
                        result.form = form;
                    }
                    analytics.reset();
                    analytics.addParam('item', item);
                    analytics.addParam('category', category.toJSON());
                    analytics.addParam('subcategory', subcategory.toJSON());
                    result.analytics = analytics.generateURL.call(this);
                    callback(err, result);
                }.bind(this));
            }
        }
    }
};
