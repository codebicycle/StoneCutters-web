'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var URLParser = require('url');
var middlewares = require('../middlewares');
var helpers = require('../helpers');
var tracking = require('../modules/tracking');
var Paginator = require('../modules/paginator');
var Seo = require('../modules/seo');
var FeatureAd = require('../models/feature_ad');
var config = require('../../shared/config');
var utils = require('../../shared/utils');

module.exports = {
    list: middlewares(list),
    show: middlewares(show),
    showig: middlewares(showig)
};

function list(params, callback) {
    helpers.controllers.control.call(this, params, controller);

    function controller() {

        var fetch = function(done) {
            if (!FeatureAd.isEnabled(this.app)) {
                return done();
            }
            var languages = this.app.session.get('languages');

            params.seo = this.app.seo.isEnabled();
            params.languageId = languages._byId[this.app.session.get('selectedLanguage')].id;
            Paginator.prepare(this.app, params);

            this.app.fetch({
                featureads: {
                    collection: 'FeatureAds',
                    params: params
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var success = function(res) {
            var platform = this.app.session.get('platform');
            var icons = config.get(['icons', platform], []);
            var location = this.app.session.get('location');
            var country = location.url;

            this.app.seo.setContent(this.dependencies.categories.meta);
            callback(null, {
                icons: (~icons.indexOf(country)) ? country.split('.') : 'default'.split('.'),
                items: res ? res.featureads : undefined
            });
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        asynquence().or(error)
            .then(fetch)
            .val(success);
    }
}

function showig(params, callback) {
    var platform = this.app.session.get('platform');

    if (platform !== 'desktop' && platform !== 'html5') {
        return helpers.common.error.call(this, null, {}, callback);
    }
    params['f.hasimage'] = true;
    show.call(this, params, callback, '-ig');
}

function show(params, callback, gallery) {
    helpers.controllers.control.call(this, params, {
        seo: false,
        cache: false
    }, controller);

    function controller() {

        var redirect = function(done){
            var categoryId = Seo.isCategoryDeprecated(params.catId);

            gallery = gallery || '';

            if (categoryId) {
                done.abort();
                return helpers.common.redirect.call(this, ['/cat-', categoryId, gallery].join(''));
            }
            done();
        }.bind(this);

        var router = function(done) {
            var category = this.dependencies.categories.get(params.catId);
            var platform = this.app.session.get('platform');
            var subcategory;

            if (!category) {
                category = this.dependencies.categories.find(function each(category) {
                    return !!category.get('children').get(params.catId);
                });
                if (!category) {
                    done.abort();
                    return helpers.common.redirect.call(this, '/');
                }
                subcategory = category.get('children').get(params.catId);
                handleItems.call(this, params, promise, gallery);
            }
            else if (platform === 'desktop') {
                handleItems.call(this, params, promise, gallery);
            }
            else {
                handleShow.call(this, params, promise);
            }
            promise.val(success);
            done(category, subcategory);
        }.bind(this);

        var success = function(_result) {
            var platform = this.app.session.get('platform');
            if ( platform === 'html4') {
                var shops = [
                            undefined,
                            {
                                "id": "54d8b6fee4b0a94af2c0e3f4",
                                "name": "Official Samsung Phones",
                                "description": "The broadest assortment of Samsung mobile phones",
                                "email": "samsung@olx.com",
                                "image": "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRYJvxoCJ8mB4CIjQX-688wF4Y8-J_BgDTQRQ0v8hYZVfwV4tlQ",
                                "location": {
                                    "lat": -1.291168,
                                    "lon": 36.821458
                                },
                                "phone": "731837091",
                                "address": "Parliament Rd in front of Machakos Bus, Nairobi",
                                "openHours": {
                                    "from": 9,
                                    "to": 9
                                },
                                "items": [
                                    {
                                        "id": 782293240,
                                        "title": "A black iPhone 5",
                                        "description": "It is the latest version and affordable.",
                                        "price": "Ksh45000",
                                        "location": "Fedha",
                                        "date": "Today, 9:38",
                                        "image": "http://images01.olx-st.com/ui/92/45/27/t_1423467532_782293240_1.jpg"
                                    }
                                ],
                                "type": 2
                            },
                            undefined,
                            {
                                "id": "54d8b729e4b0a94af2c0e3f5",
                                "name": "I Call U Mobiles",
                                "description": "All mobile phone brands in an only place. Buy Safe, Buy I Call U",
                                "email": "icallu@olx.com",
                                "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkfKRnhOKXQ9AGZ-qeOaCy-uxHQLGFR1l4DksWeU0Oij8b-bOIBQ",
                                "location": {
                                    "lat": -1.291929,
                                    "lon": 36.821855
                                },
                                "phone": "701593759",
                                "address": "Parliament Rd in next to Braintech Clinic, Nairobi",
                                "openHours": {
                                    "from": 9,
                                    "to": 9
                                },
                                "items": [
                                    {
                                        "id": 782205472,
                                        "title": "Galaxy Samsung Note 3, affordable and new from Korea",
                                        "description": "<p>super perfect phone, android supported and you can get all the apps from the play store. a working stylus and available immediately. call now</p>",
                                        "price": "Ksh13100",
                                        "location": "Car wash",
                                        "date": "Today, 20:40",
                                        "image": "http://images04.olx-st.com/ui/69/16/52/t_1423420835_782205472_1.jpg"
                                    }
                                ],
                                "type": 1
                            },
                            undefined,
                            {
                                "id": "54d8b729e4b0a94af2c0e3f5",
                                "name": "I Call U Mobiles",
                                "description": "All mobile phone brands in an only place. Buy Safe, Buy I Call U",
                                "email": "icallu@olx.com",
                                "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkfKRnhOKXQ9AGZ-qeOaCy-uxHQLGFR1l4DksWeU0Oij8b-bOIBQ",
                                "location": {
                                    "lat": -1.291929,
                                    "lon": 36.821855
                                },
                                "phone": "701593759",
                                "address": "Parliament Rd in next to Braintech Clinic, Nairobi",
                                "openHours": {
                                    "from": 9,
                                    "to": 9
                                },
                                "items": [
                                    {
                                        "id": 782205472,
                                        "title": "Galaxy Samsung Note 3, affordable and new from Korea",
                                        "description": "<p>super perfect phone, android supported and you can get all the apps from the play store. a working stylus and available immediately. call now</p>",
                                        "price": "Ksh13100",
                                        "location": "Car wash",
                                        "date": "Today, 20:40",
                                        "image": "http://images04.olx-st.com/ui/69/16/52/t_1423420835_782205472_1.jpg"
                                    }
                                ],
                                "type": 1
                            },
                            undefined,
                            undefined,
                            {
                                "id": "54d8b753e4b0a94af2c0e3f6",
                                "name": "Santek Technology",
                                "description": "Mobiles and accesories, we sell all the major brands",
                                "email": "santek@olx.com",
                                "image": "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcRybLH8p12X14pFD65iR8TMFlnyqWWxquZ2QjVrWKnA6WFj6JxJ",
                                "location": {
                                    "lat": -1.290417,
                                    "lon": 36.821437
                                },
                                "phone": "716368206",
                                "address": "Harambee Ave in front of Sheria House, Nairobi",
                                "openHours": {
                                    "from": 9,
                                    "to": 9
                                },
                                "items": [
                                    {
                                        "id": 782189851,
                                        "title": "Tablet tecno type",
                                        "description": "its new and pink in colour at the back",
                                        "price": "",
                                        "location": "Baragoi",
                                        "date": "Today, 18:41",
                                        "image": "/images/html4/noPhoto.png"
                                    }
                                ],
                                "type": 2
                            }
                        ];
                var getCenter = function(shops) {
                    var minLat = 91;
                    var maxLat = -91;
                    var minLng = 181;
                    var maxLng = -181;
                    var shopLocation;
                    var lat;
                    var lng;

                    for (var j in shops) {
                        if (shops[j]) {
                            shopLocation = shops[j].location;
                            if (shopLocation.lat > maxLat) {
                                maxLat = shopLocation.lat;
                            }
                            if (shopLocation.lat < minLat) {
                                minLat = shopLocation.lat;
                            }
                            if (shopLocation.lng > maxLng) {
                                maxLng = shopLocation.lng;
                            }
                            if (shopLocation.lng < minLng) {
                                minLng = shopLocation.lng;
                            }
                        }
                    }
                    lat = (maxLat + minLat) / 2;
                    lng = (maxLng + minLng) / 2;
                    return JSON.stringify({"lat": lat, "lng": lng});
                };

                _result.center = getCenter(shops);
                _result.shops = shops;
                callback(null, _result);
            }
            else {
                callback(null, _result);
            }
        }.bind(this);

        var error = function(err, res) {
            return helpers.common.error.call(this, err, res, callback);
        }.bind(this);

        var promise = asynquence().or(error)
            .then(redirect)
            .then(router);
    }
}

function handleItems(params, promise, gallery) {
    var page = params ? params.page : undefined;
    var languages = this.app.session.get('languages');
    var path = this.app.session.get('path');
    var starts = '/nf';
    var category;
    var subcategory;
    var query;
    var url;

    var configure = function(done, _category, _subcategory) {
        var currentRouter = ['categories', 'items'];

        category = _category;
        subcategory = _subcategory;

        this.app.seo.reset(this.app, {
            page: currentRouter
        });
        helpers.controllers.changeHeaders.call(this, {}, currentRouter);
        done();
    }.bind(this);

    var redirect = function(done) {
        var platform = this.app.session.get('platform');
        var slug = helpers.common.slugToUrl((subcategory || category).toJSON());

        url = ['/', slug].join('');

        if (slug.indexOf(params.title + '-cat-')) {
            done.abort();
            if (page === undefined || isNaN(page) || page <= 1) {
                return helpers.common.redirect.call(this, [url, gallery].join(''));
            }
            return helpers.common.redirect.call(this, [url, '-p-', page, gallery].join(''));
        }
        if ((params.filters && params.filters !== 'undefined') && !utils.startsWith(path, starts)) {
            done.abort();
            return helpers.common.redirect.call(this, [starts, path, URLParser.parse(this.app.session.get('url')).search || ''].join(''));
        }
        else if ((!params.filters || params.filters === 'undefined') && utils.startsWith(path, starts)) {
            done.abort();
            return helpers.common.redirect.call(this, [path.replace(starts, ''), URLParser.parse(this.app.session.get('url')).search || ''].join(''));
        }
        done();
    }.bind(this);

    var prepare = function(done) {
        Paginator.prepare(this.app, params);

        query = _.clone(params);
        params.categoryId = params.catId;
        params.abundance = true;
        params.seo = this.app.seo.isEnabled();
        params.languageId = languages._byId[this.app.session.get('selectedLanguage')].id;
        delete params.catId;
        delete params.title;
        delete params.page;
        delete params.filters;
        done();
    }.bind(this);

    var fetchFeatured = function(done) {
        if (!FeatureAd.isEnabled(this.app)) {
            return done();
        }
        this.app.fetch({
            featureads: {
                collection: 'FeatureAds',
                params: _.clone(params)
            }
        }, {
            readFromCache: false
        }, done.errfcb);
    }.bind(this);

    var fetch = function(done, res) {
        this.app.fetch({
            items: {
                collection: 'Items',
                params: params
            }
        }, {
            readFromCache: false
        }, function afterFetch(err, response) {
            if (err) {
                return done.fail(err);
            }
            if (response && res && res.featureads) {
                res.featureads.mergeTo(response.items);
            }
            done(response);
        });
    }.bind(this);

    var filters = function(done, res) {
        var url = this.app.session.get('url');
        var filter;
        var _filters;

        if (!res.items) {
            return done.fail(null, {});
        }
        filter = query.filters;
        if (!filter || filter === 'undefined') {
            return done(res);
        }
        _filters = res.items.filters.format();
        if (filter !== _filters) {
            done.abort();
            url = [path.split('/-').shift(), (_filters ? '/' + _filters : ''), URLParser.parse(url).search || ''].join('');
            return helpers.common.redirect.call(this, url);
        }
        done(res);
    }.bind(this);

    var paginate = function(done, res) {
        var realPage;

        if (page == 1) {
            done.abort();
            return helpers.common.redirect.call(this, [url, gallery].join(''));
        }
        realPage = res.items.paginate([url, '[page][gallery][filters]'].join(''), query, {
            page: page,
            gallery: gallery
        });
        if (realPage) {
            done.abort();
            return helpers.common.redirect.call(this, [url, '-p-', realPage, gallery].join(''));
        }
        done(res.items);
    }.bind(this);

    var success = function(done, items) {
        var meta = items.meta;
        var dataPage = {
            category: category.get('id')
        };

        if (subcategory) {
            dataPage.subcategory = subcategory.get('id');
        }
        this.app.session.update({
            dataPage: dataPage
        });

        this.app.seo.setContent(meta);
        if (meta.total < 5) {
            this.app.seo.addMetatag('robots', 'noindex, follow');
            this.app.seo.addMetatag('googlebot', 'noindex, follow');
        }

        tracking.setPage('listing');
        tracking.addParam('category', category.toJSON());
        if (subcategory) {
            tracking.addParam('subcategory', subcategory.toJSON());
        }
        tracking.addParam('page', query.page);
        tracking.addParam('filters', items.filters);
        tracking.addParam('paginator', items.paginator);

        done({
            type: 'items',
            category: category.toJSON(),
            subcategory: (subcategory || category).toJSON(),
            currentCategory: (subcategory ? subcategory.toJSON() : category.toJSON()),
            relatedAds: query.relatedAds,
            meta: meta,
            items: items.toJSON(),
            filters: items.filters,
            paginator: items.paginator,
            hasItemsWithImages: items.hasImages()
        });
    }.bind(this);

    promise.then(configure);
    promise.then(redirect);
    promise.then(prepare);
    promise.then(fetchFeatured);
    promise.then(fetch);
    promise.then(filters);
    promise.then(paginate);
    promise.then(success);
}

function handleShow(params, promise) {
    var category;

    var configure = function(done, _category) {
        var currentRouter = ['categories', 'subcategories'];

        category = _category;

        this.app.seo.reset(this.app, {
            page: currentRouter
        });
        helpers.controllers.changeHeaders.call(this, {}, currentRouter);
        done();
    }.bind(this);

    var redirect = function(done) {
        var slug = helpers.common.slugToUrl(category.toJSON());

        if (!category.checkSlug(slug, params.title)) {
            done.abort();
            return helpers.common.redirect.call(this, '/' + slug);
        }
        done();
    }.bind(this);

    var success = function(done) {
        this.app.session.update({
            dataPage: {
                category: category.get('id')
            }
        });

        this.app.seo.addMetatag('title', category.get('trName'));
        this.app.seo.addMetatag('description', category.get('trName'));

        tracking.addParam('category', category.toJSON());

        done({
            type: 'categories',
            category: category.toJSON()
        });
    }.bind(this);

    promise.then(configure);
    promise.then(redirect);
    promise.then(success);
}
