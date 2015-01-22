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

var ShowItems = Base.extend({
    redirection: redirection,
    action: action
});

function initialize(attrs, options) {
    var params = options.params;
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
}

function control() {
    promise.then(configure);
    promise.then(redirection);
    promise.then(prepare);
    promise.then(fetch);
    promise.then(filters);
    promise.then(paginate);
    promise.then(success);
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
    var platform = this.app.session.get('platform');
    var slug = helpers.common.slugToUrl((subcategory || category).toJSON());

    url = ['/', slug].join('');

    if (slug.indexOf(params.title + '-cat-')) {
        done.abort();
        if (page === undefined || isNaN(page) || page <= 1) {
            return this.redirect([url, gallery].join(''));
        }
        return this.redirect([url, '-p-', page, gallery].join(''));
    }
    if ((params.filters && params.filters !== 'undefined') && !utils.startsWith(path, starts)) {
        done.abort();
        return this.redirect([starts, path, URLParser.parse(this.app.session.get('url')).search || ''].join(''));
    }
    else if ((!params.filters || params.filters === 'undefined') && utils.startsWith(path, starts)) {
        done.abort();
        return this.redirect([path.replace(starts, ''), URLParser.parse(this.app.session.get('url')).search || ''].join(''));
    }
    done();
}

function prepare(done) {
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
}

function fetch(done) {
    this.app.fetch({
        items: {
            collection: 'Items',
            params: params
        }
    }, {
        readFromCache: false
    }, done.errfcb);
}

function filters(done, res) {
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
        return this.redirect(url);
    }
    done(res);
}

function paginate(done, res) {
    var realPage;

    if (page == 1) {
        done.abort();
        return this.redirect([url, gallery].join(''));
    }
    realPage = res.items.paginate([url, '[page][gallery][filters]'].join(''), query, {
        page: page,
        gallery: gallery
    });
    if (realPage) {
        done.abort();
        return this.redirect([url, '-p-', realPage, gallery].join(''));
    }
    done(res.items);
}

function success(done, items) {
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
        paginator: items.paginator,
        hasItemsWithImages: items.hasImages()
    });
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

    var redirection = function(done) {
        var slug = helpers.common.slugToUrl(category.toJSON());

        if (!category.checkSlug(slug, params.title)) {
            done.abort();
            return this.redirect('/' + slug);
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
    promise.then(redirection);
    promise.then(success);
}

module.exports = ShowItems;
