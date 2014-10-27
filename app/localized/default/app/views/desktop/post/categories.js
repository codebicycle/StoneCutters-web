'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var tracking = require('../../../../../../modules/tracking');
var _ = require('underscore');
var asynquence = require('asynquence');

module.exports = Base.extend({
    tagName: 'section',
    id: 'posting-categories-view',
    className: 'posting-categories-view wrapper',
    events: {
        'click .child-categories-list a': 'onSubCategoryClick'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            categories: this.parentView.options.categories.toJSON()
        });
    },
    onSubCategoryClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var subcategory = $(event.currentTarget);
        var subcategoryId = subcategory.data('id');
        var categoryId = subcategory.parents('.subcategories').siblings('.category').data('id');

        var fetch = function(done) {
            $('body > .loading').show();
            this.app.fetch({
                fields: {
                    model: 'Field',
                    params: {
                        intent: 'post',
                        location: this.app.session.get('siteLocation'),
                        categoryId: subcategoryId,
                        languageId: this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id
                    }
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var error = function(err) {
            $('body > .loading').hide();
            console.log(err); // TODO: HANDLE ERRORS
        }.bind(this);

        var track = function(done, res) {
            var $view = $('#partials-tracking-view');

            tracking.reset();
            tracking.setPage('desktop_steb2');

            $view.trigger('update', tracking.generateURL.call(this));

            done(res);
        }.bind(this);

        var success = function(res) {
            $('body > .loading').hide();
            this.parentView.$el.trigger('subcategorySubmit', {
                parentId: categoryId,
                id: subcategoryId,
                fields: res.fields.get('fields')
            });
        }.bind(this);

        asynquence().or(error)
            .then(fetch)
            .then(track)
            .val(success);
    }
});

module.exports.id = 'post/categories';
