'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var Base = require('../../bases/action');
var Seo = require('../../../../modules/seo');
var ShowItems = require('./showitems');
var ShowCategories = require('./showcategories');

var Show = Base.extend({
    redirection: redirection,
    action: action
});

function redirection(done){
    var params = this.get('params');
    var categoryId = Seo.isCategoryDeprecated(params.catId);

    if (categoryId) {
        done.abort();
        return this.redirect(['/cat-', categoryId, this.get('gallery')].join(''));
    }
    done();
}

function action(done) {
    var promise = asynquence().or(done.fail);
    var params = this.get('params');
    var category = this.dependencies.categories.get(params.catId);
    var platform = this.app.session.get('platform');
    var options = {
        app: this.app,
        currentRoute: this.currentRoute,
        redirectTo: this.redirectTo,
        dependencies: this.dependencies,
        include: this.include,
        form: this.form,
        promise: promise,
        category: category
    };
    var subcategory;
    var subAction;

    if (!category) {
        category = this.dependencies.categories.find(function each(category) {
            return !!category.get('children').get(params.catId);
        });
        if (!category) {
            done.abort();
            return this.redirect('/');
        }
        subcategory = category.get('children').get(params.catId);
        subAction = new ShowItems(this.toJSON(), _.extend(options, {
            category: category,
            subcategory: subcategory
        }));
    }
    else if (platform === 'desktop') {
        subAction = new ShowItems(this.toJSON(), options);
    }
    else {
        subAction = new ShowCategories(this.toJSON(), options);
    }
    subAction.control();
    promise.val(done);
}

module.exports = Show;
