'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var URLParser = require('url');
var Base = require('../../bases/action');
var helpers = require('../../../../helpers');
var tracking = require('../../../../modules/tracking');
var Paginator = require('../../../../modules/paginator');
var Seo = require('../../../../modules/seo');
var config = require('../../../../../shared/config');
var utils = require('../../../../../shared/utils');

var Show = Base.extend({
    redirect: redirect,
    prepare: prepare
});

function redirect(done){
    var params = this.get('params');
    var categoryId = Seo.isCategoryDeprecated(params.catId);

    if (categoryId) {
        done.abort();
        return helpers.common.redirect.call(this, ['/cat-', categoryId, this.get('gallery')].join(''));
    }
    done();
}

function prepare(done) {
    var promise = asynquence().or(done.fail);
    var params = this.get('params');
    var category = this.dependencies.categories.get(params.catId);
    var platform = this.app.session.get('platform');
    var gallery = this.get('gallery');
    var options = {
        promise: promise
    };
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
        handleItems.call(this, params, _.extend(options, {
            gallery: gallery,
            category: category,
            subcategory: subcategory
        }));
    }
    else if (platform === 'desktop') {
        handleItems.call(this, params, _.extend(options, {
            gallery: gallery
        }));
    }
    else {
        handleShow.call(this, params, options);
    }
    promise.val(done);
}

function handleItems(params, options) {
    var promise = options.promise;
    var gallery = options.gallery;
    var category = options.category;
    var subcategory = options.subcategory;
    var page = params ? params.page : undefined;
    var languages = this.app.session.get('languages');
    var path = this.app.session.get('path');
    var starts = '/nf';
    var query;
    var url;

    var configure = function(done) {
        var currentRouter = ['categories', 'items'];

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
        params.seo = this.app.seo.isEnabled();
        params.languageId = languages._byId[this.app.session.get('selectedLanguage')].id;
        delete params.catId;
        delete params.title;
        delete params.page;
        delete params.filters;
        done();
    }.bind(this);

    var fetch = function(done) {
        this.app.fetch({
            items: {
                collection: 'Items',
                params: params
            }
        }, {
            readFromCache: false
        }, done.errfcb);
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

        done({
            type: 'items',
            category: category.toJSON(),
            subcategory: (subcategory || category).toJSON(),
            currentCategory: (subcategory ? subcategory.toJSON() : category.toJSON()),
            relatedAds: query.relatedAds,
            meta: meta,
            items: items.toJSON(),
            filters: items.filters,
            paginator: items.paginator
        });
    }.bind(this);

    promise.then(configure);
    promise.then(redirect);
    promise.then(prepare);
    promise.then(fetch);
    promise.then(filters);
    promise.then(paginate);
    promise.then(success);
}

function handleShow(params, options) {
    var category = options.category;
    var promise = options.promise;

    var configure = function(done) {
        var currentRouter = ['categories', 'subcategories'];

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

module.exports = Show;
