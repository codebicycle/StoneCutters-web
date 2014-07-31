'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var helpers = require('../helpers');
var seo = require('../seo');
var analytics = require('../analytics');
var config = require('../config');

function handleItems(params, promise) {
    var page = params ? params.page : undefined;
    var infiniteScroll = config.get('infiniteScroll', false);
    var platform = this.app.session.get('platform');
    var category;
    var subcategory;
    var query;

    function prepare(done, _category, _subcategory) {
        var currentRouter = ['categories', 'items'];
        var slug;

        category = _category;
        subcategory = _subcategory;

        helpers.controllers.changeHeaders.call(this, false, currentRouter);
        seo.resetHead.call(this, currentRouter);

        slug = helpers.common.slugToUrl((subcategory || category).toJSON());
        if (platform === 'html5' && infiniteScroll && (typeof page !== 'undefined' && !isNaN(page) && page > 1)) {
            done.abort();
            return helpers.common.redirect.call(this, '/' + slug);
        }
        if (slug.indexOf(params.title + '-cat-')) {
            done.abort();
            if (typeof page === 'undefined' || (isNaN(page) || page <= 1 || page >= 999999)) {
                return helpers.common.redirect.call(this, '/' + slug);
            }
            return helpers.common.redirect.call(this, '/' + slug + '-p-' + page);
        }
        helpers.pagination.prepare(this.app, params);
        query = _.clone(params);

        params.categoryId = params.catId;
        params.seo = true;
        params.languageId = this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id;
        delete params.catId;
        delete params.title;
        delete params.page;
        delete params.filters;
        delete params.urlFilters;
        done();
    }

    function findItems(done) {
        this.app.fetch({
            items: {
                collection: 'Items',
                params: params
            }
        }, {
            readFromCache: false
        }, done.errfcb);
    }

    function checkItems(done, res) {
        var url = '/' + query.title + '-cat-' + query.catId;
        var currentPage;

        if (typeof page !== 'undefined' && (isNaN(page) || page <= 1 || page >= 999999  || !res.items.length)) {
            done.abort();
            return helpers.common.redirect.call(this, '/' + helpers.common.slugToUrl((subcategory || category).toJSON()), null, {
                status: 302
            });
        }
        done(res.items);
    }

    function success(done, _items) {
        var url = '/' + query.title + '-cat-' + query.catId;
        var metadata = _items.metadata;
        var postingLink = {
            category: category.get('id')
        };
        var currentPage;
        
        helpers.pagination.paginate(metadata, query, url);
        helpers.filters.prepare(metadata);

        if (subcategory) {
            postingLink.subcategory = subcategory.get('id');
        }
        this.app.session.update({
            postingLink: postingLink 
        });

        analytics.reset();
        analytics.setPage('listing');
        analytics.addParam('category', category.toJSON());
        if (subcategory) {
            analytics.addParam('subcategory', subcategory.toJSON());
        }
        if (metadata.seo) {
            currentPage = metadata.page;
            seo.addMetatag('title', metadata.seo.title + (currentPage > 1 ? (' - ' + currentPage) : ''));
            seo.addMetatag('description', metadata.seo.description + (currentPage > 1 ? (' - ' + currentPage) : ''));
        }
        if (metadata.total < 5) {
            seo.addMetatag('robots', 'noindex, follow');
            seo.addMetatag('googlebot', 'noindex, follow');
        }
        seo.update();

        done({
            type: 'items',
            category: category.toJSON(),
            subcategory: (subcategory || category).toJSON(),
            currentCategory: (subcategory ? subcategory.toJSON() : category.toJSON()),
            relatedAds: query.relatedAds,
            metadata: metadata,
            items: _items.toJSON(),
            infiniteScroll: infiniteScroll,
            analytics: analytics.generateURL.call(this)
        });
    }

    promise.then(prepare.bind(this));
    promise.then(findItems.bind(this));
    promise.then(checkItems.bind(this));
    promise.then(success.bind(this));
}

function handleShow(params, promise) {

    function prepare(done, _category) {
        var currentRouter = ['categories', 'subcategories'];
        var slug;

        helpers.controllers.changeHeaders.call(this, false, currentRouter);
        seo.resetHead.call(this, currentRouter);

        slug = helpers.common.slugToUrl(_category.toJSON());
        if (!_category.checkSlug(slug, params.title)) {
            done.abort();
            return helpers.common.redirect.call(this, '/' + slug);
        }
        done(_category);
    }

    function success(done, _category) {
        this.app.session.update({
            postingLink: {
                category: _category.get('id')
            }
        });

        analytics.reset();
        analytics.addParam('user', this.app.session.get('user'));
        analytics.addParam('category', _category.toJSON());
        seo.addMetatag.call(this, 'title', _category.get('trName'));
        seo.addMetatag.call(this, 'description', _category.get('trName'));
        seo.update();

        done({
            type: 'categories',
            category: _category.toJSON(),
            analytics: analytics.generateURL.call(this)
        });
    }

    promise.then(prepare.bind(this));
    promise.then(success.bind(this));
}

module.exports = {
    list: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            var platform = this.app.session.get('platform');
            var icons = config.get(['icons', platform], []);
            var country = this.app.session.get('location').url;
            
            this.app.fetch({
                categories: {
                    collection: 'Categories',
                    params: {
                        location: this.app.session.get('siteLocation'),
                        languageCode: this.app.session.get('selectedLanguage'),
                        seo: true
                    }
                }
            }, {
                readFromCache: false
            }, function afterFetch(err, result) {
                analytics.reset();
                seo.addMetatag('title', result.categories.metadata.title);
                seo.addMetatag('description', result.categories.metadata.description);
                seo.update();
                callback(null, {
                    categories: result.categories.toJSON(),
                    icons: (~icons.indexOf(country)) ? country.split('.') : 'default'.split('.'),
                    analytics: analytics.generateURL.call(this)
                });
            }.bind(this));
        }
    },
    show: function(params, callback) {
        helpers.controllers.control.call(this, params, {
            seo: false,
            cache: false
        }, controller);

        function controller() {
            var promise = asynquence().or(error.bind(this))
                .then(findCategories.bind(this))
                .then(router.bind(this));

            function findCategories(done) {
                this.app.fetch({
                    categories: {
                        collection: 'Categories',
                        params: {
                            location: this.app.session.get('siteLocation'),
                            languageCode: this.app.session.get('selectedLanguage'),
                            seo: true
                        }
                    }
                }, {
                    readFromCache: false
                }, done.errfcb);
            }

            function router(done, res) {
                if (!res.categories) {
                    return done.fail(null, {});
                }
                var category = res.categories.get(params.catId);
                var platform = this.app.session.get('platform');
                var subcategory;

                if (!category) {
                    category = res.categories.find(function each(category) {
                        return !!category.get('children').get(params.catId);
                    });
                    if (!category) {
                        done.abort();
                        return helpers.common.redirect.call(this, '/');
                    }
                    subcategory = category.get('children').get(params.catId);
                    handleItems.call(this, params, promise);
                } 
                else if (platform === 'desktop') {
                    handleItems.call(this, params, promise);
                }
                else {
                    handleShow.call(this, params, promise);
                }
                promise.val(success.bind(this));
                done(category, subcategory);
            }

            function success(_result) {
                callback(null, _result);
            }

            function error(err, res) {
                return helpers.common.error.call(this, err, res, callback);
            }
        }
    }
};
