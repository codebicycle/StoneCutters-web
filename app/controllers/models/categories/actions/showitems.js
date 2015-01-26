'use strict';

var _ = require('underscore');
var URLParser = require('url');
var Base = require('../../bases/action');
var helpers = require('../../../../helpers');
var tracking = require('../../../../modules/tracking');
var Paginator = require('../../../../modules/paginator');
var utils = require('../../../../../shared/utils');
var ShopsAdmin = require('../../../../modules/shopsadmin');

var ShowItems = Base.extend({
    initialize: initialize,
    control: control,
    configure: configure,
    redirection: redirection,
    prepare: prepare,
    fetch: fetch,
    filters: filters,
    paginate: paginate,
    success: success
});

function initialize(attrs, options) {
    Base.prototype.initialize.apply(this, arguments);

    var params = this.get('params');

    this.promise = options.promise;
    this.category = options.category;
    this.subcategory = options.subcategory;
    this.page = params ? params.page : undefined;
}

function control() {
    this.promise.then(this.configure.bind(this));
    this.promise.then(this.redirection.bind(this));
    this.promise.then(this.prepare.bind(this));
    this.promise.then(this.fetch.bind(this));
    this.promise.then(this.filters.bind(this));
    this.promise.then(this.paginate.bind(this));
    this.promise.then(this.success.bind(this));
}

function configure(done) {
    var currentRouter = ['categories', 'items'];

    this.app.seo.reset(this.app, {
        page: currentRouter
    });
    helpers.controllers.changeHeaders.call(this, {}, currentRouter);
    done();
}

function redirection(done) {
    var path = this.app.session.get('path');
    var platform = this.app.session.get('platform');
    var slug = helpers.common.slugToUrl((this.subcategory || this.category).toJSON());
    var params = this.get('params');
    var url = ['/', slug].join('');
    var starts = '/nf';

    if (slug.indexOf(params.title + '-cat-')) {
        done.abort();
        if (this.page === undefined || isNaN(this.page) || this.page <= 1) {
            return this.redirect([url, this.get('gallery')].join(''));
        }
        return this.redirect([url, '-p-', this.page, this.get('gallery')].join(''));
    }
    if ((params.filters && params.filters !== 'undefined') && !utils.startsWith(path, starts)) {
        done.abort();
        return this.redirect([starts, path, URLParser.parse(this.app.session.get('url')).search || ''].join(''));
    }
    else if ((!params.filters || params.filters === 'undefined') && utils.startsWith(path, starts)) {
        done.abort();
        return this.redirect([path.replace(starts, ''), URLParser.parse(this.app.session.get('url')).search || ''].join(''));
    }
    done(params);
}

function prepare(done, params) {
    var languages = this.app.session.get('languages');

    Paginator.prepare(this.app, params);

    this.query = _.clone(params);
    params.categoryId = params.catId;
    params.seo = this.app.seo.isEnabled();
    params.languageId = languages._byId[this.app.session.get('selectedLanguage')].id;
    delete params.catId;
    delete params.title;
    delete params.page;
    delete params.filters;
    done(params);
}

function fetch(done, params) {
    this.app.fetch({
        items: {
            collection: 'Items',
            params: params
        },
        shops: {
            collection: 'Shops',
            params: params,
        }
    }, {
        readFromCache: false
    }, done.errfcb);
}

function filters(done, res) {
    var url = this.app.session.get('url');
    var path = this.app.session.get('path');
    var filter;
    var _filters;

    if (!res.items) {
        return done.fail(null, {});
    }
    filter = this.query.filters;
    if (!filter || filter === 'undefined') {
        return done(res);
    }
    _filters = res.items.filters.format();
    if (filter !== _filters) {
        done.abort();
        url = [path.split('/-').shift(), (_filters ? '/' + _filters : ''), URLParser.parse(url).search || ''].join('');
        return this.redirect(url);
    }
    done(res);
}

function paginate(done, res) {
    var slug = helpers.common.slugToUrl((this.subcategory || this.category).toJSON());
    var url = ['/', slug].join('');
    var realPage;

    if (this.page == 1) {
        done.abort();
        return this.redirect([url, this.get('gallery')].join(''));
    }
    realPage = res.items.paginate([url, '[page][gallery][filters]'].join(''), this.query, {
        page: this.page,
        gallery: this.get('gallery')
    });
    if (realPage) {
        done.abort();
        return this.redirect([url, '-p-', realPage, this.get('gallery')].join(''));
    }
    done(res.items, res.shops);
}

function success(done, items, shops) {
    var shopsAdmin = new ShopsAdmin();
    shopsAdmin.setShops(shops.toJSON());
    var meta = items.meta;
    var dataPage = {
        category: this.category.get('id')
    };

    if (this.subcategory) {
        dataPage.subcategory = this.subcategory.get('id');
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
    tracking.addParam('category', this.category.toJSON());
    if (this.subcategory) {
        tracking.addParam('subcategory', this.subcategory.toJSON());
    }
    tracking.addParam('page', this.query.page);

    done({
        type: 'items',
        category: this.category.toJSON(),
        subcategory: (this.subcategory || this.category).toJSON(),
        currentCategory: (this.subcategory ? this.subcategory.toJSON() : this.category.toJSON()),
        relatedAds: this.query.relatedAds,
        meta: meta,
        items: items.toJSON(),
        shops: shops !== undefined ? shops.toJSON() : [],
        shopsAdmin: shopsAdmin,
        filters: items.filters,
        paginator: items.paginator,
        hasItemsWithImages: items.hasImages()
    });
}

module.exports = ShowItems;
