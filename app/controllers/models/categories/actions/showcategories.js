'use strict';

var Base = require('../../bases/action');
var helpers = require('../../../../helpers');
var tracking = require('../../../../modules/tracking');

var ShowCategories = Base.extend({
    initialize: initialize,
    control: control,
    configure: configure,
    redirection: redirection,
    success: success
});

function initialize(attrs, options) {
    Base.prototype.initialize.apply(this, arguments);

    this.promise = options.promise;
    this.category = options.category;
}

function control() {
    this.promise.then(this.configure.bind(this));
    this.promise.then(this.redirection.bind(this));
    this.promise.then(this.success.bind(this));
}

function configure(done) {
    var currentRouter = ['categories', 'subcategories'];

    this.app.seo.reset(this.app, {
        page: currentRouter
    });
    helpers.controllers.changeHeaders.call(this, {}, currentRouter);
    done();
}

function redirection(done) {
    var params = this.get('params');
    var slug = helpers.common.slugToUrl(this.category.toJSON());

    if (!this.category.checkSlug(slug, params.title)) {
        done.abort();
        return this.redirect('/' + slug);
    }
    done();
}

function success(done) {
    this.app.session.update({
        dataPage: {
            category: this.category.get('id')
        }
    });

    this.app.seo.addMetatag('title', this.category.get('trName'));
    this.app.seo.addMetatag('description', this.category.get('trName'));

    tracking.addParam('category', this.category.toJSON());

    done({
        type: 'categories',
        category: this.category.toJSON()
    });
}

module.exports = ShowCategories;
