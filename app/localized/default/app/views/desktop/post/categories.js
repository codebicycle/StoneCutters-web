'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var tracking = require('../../../../../../modules/tracking');
var _ = require('underscore');
var asynquence = require('asynquence');
var User = require('../../../../../../models/user');

module.exports = Base.extend({
    tagName: 'section',
    id: 'posting-categories-view',
    className: 'posting-categories-view field-wrapper',
    events: {
        'click .posting-categories-list a.category': 'onCategoryClick',
        'click .child-categories-list a': 'onSubCategoryClick',
        'editCategory': 'onEditCategory',
        'getQueryCategory': 'onGetQueryCategory'

    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            categories: data.categories.toJSON()
        });
    },
    onEditCategory: function(event, category) {
        this.$('.posting-categories-list a[data-id=' + category.parentId + ']').trigger('click', ['edit']);
        this.$('.child-categories-list a[data-id=' + category.id + ']').trigger('click', ['edit']);
    },
    onGetQueryCategory: function(event, category) {
        this.$('.posting-categories-list a[data-id=' + category.parentCategory + ']').trigger('click');
        if (category.subCategory) {
            this.$('.child-categories-list a[data-id=' + category.subCategory + ']').trigger('click');
        }
    },
    onSubCategoryClick: function(event, intent) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var subcategory = $(event.currentTarget);
        var subcategoryId = subcategory.data('id');
        var categoryId = subcategory.parents('.subcategories').siblings('.category').data('id');
        var user = this.app.session.get('user');
        var params = {
            intent: intent ? 'edit' : 'post',
            languageId: this.app.session.get('languageId')
        };

        if(this.$el.hasClass('error')) {
            this.$el.attr('data-cat-error','true');
        }
        if (params.intent === 'post') {
            params.location = this.app.session.get('siteLocation');
            params.categoryId = subcategoryId;
        }
        else {
            params.itemId = this.parentView.getItem().get('id');
            if (user) {
                params.token = user.token;
            }
            else {
                params.securityKey = this.parentView.getItem().get('securityKey');
            }
        }

        $('a.category').removeClass('select');
        $('a.subcategory').removeClass('select icon-check');
        subcategory.addClass('select icon-check');
        $('.category[data-id="' + categoryId + '"]').addClass('select');
        $('.child-categories-list').removeClass('select');
        $('.child-categories-list[data-id="' + categoryId + '"]').addClass('select');
        if (!this.parentView.editing) {
            $('html, body').animate({
                scrollTop: this.parentView.$('#posting-images-view').offset().top
            }, 750);
        }

        var fetch = function(done) {
            this.app.fetch({
                fields: {
                    model: 'Field',
                    params: params
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var error = function(err) {
            console.log(err); // TODO: HANDLE ERRORS
        }.bind(this);

        var track = function(done, res) {
            var $view = $('#partials-tracking-view');

            tracking.reset();
            tracking.setPage('desktop_step2');
            $view.trigger('update', tracking.generateURL.call(this));
            done(res);
        }.bind(this);

        var success = function(res) {

            this.$('.error.message').remove();
            this.$el.removeClass('error').addClass('success');
            this.parentView.$el.trigger('subcategorySubmit', {
                parentId: categoryId,
                id: subcategoryId,
                fields: res.fields.get('fields')
            });

            if(this.$el.attr('data-cat-error')) {
                var $fieldsToValidate = $('input, select, textarea');
                $fieldsToValidate.each(function(index) {
                    if(!$(this).hasClass('image-input-file') && $(this).attr('required') && $(this).attr('id') !== 'field-location' ) {
                        $(this).change();
                    }
                });
                this.$el.removeAttr('data-cat-error','true');
            }
        }.bind(this);

        asynquence().or(error)
            .then(fetch)
            .then(track)
            .val(success);
    },
    onCategoryClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $target = $(event.currentTarget);

        $('a.category').removeClass('select');
        $('.child-categories-list').removeClass('select');
        $('a.subcategory').removeClass('select icon-check');

        $('a.category').removeClass('active');
        $('.child-categories-list').addClass('hide');
        $target.addClass('active');
        $('.child-categories-list[data-id="' + $target.data('id') + '"]').removeClass('hide');
    }
});

module.exports.id = 'post/categories';
