'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var Tracking = require('../../../../../../modules/tracking');
var utils = require('../../../../../../../shared/utils');

module.exports = Base.extend({
    id: 'posting-categories-view',
    tagName: 'section',
    className: 'posting-categories-view field-wrapper',
    events: {
        'editCategory': onEditCategory,
        'getQueryCategory': onGetQueryCategory,
        'click .posting-categories-list a.category': onClickCategory,
        'click .child-categories-list a': onClickSubCategory,
        'click #posting-category-suggestion-button': onShowCategoryList
    },
    getTemplateData: getTemplateData
});

function getTemplateData() {
    var data = Base.prototype.getTemplateData.call(this);

    return _.extend({}, data, {
        categories: data.categories.toJSON()
    });
}

function onEditCategory(event, category) {
    this.$('.posting-categories-list a[data-id=' + category.parentId + ']').trigger('click', ['edit']);
    this.$('.child-categories-list a[data-id=' + category.id + ']').trigger('click', ['edit']);
}

function onGetQueryCategory(event, category) {
    this.$('.posting-categories-list a[data-id=' + category.parentCategory + ']').trigger('click');
    if (category.subCategory) {
        this.$('.child-categories-list a[data-id=' + category.subCategory + ']').trigger('click');
    }
}

function onClickCategory(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    var $target = $(event.currentTarget);
    var $fieldCat = this.$('.posting-categories-list');

    if ($fieldCat.closest('.field-wrapper').hasClass('error')) {
       $fieldCat.closest('.field-wrapper').removeClass('error').find('.error.message').remove();
    }

    $('a.category').removeClass('select');
    $('.child-categories-list').removeClass('select');
    $('a.subcategory').removeClass('select icon-check');

    $('a.category').removeClass('active');
    $('.child-categories-list').addClass('hide');
    $target.addClass('active');
    $('.child-categories-list[data-id="' + $target.data('id') + '"]').removeClass('hide');
}

function onClickSubCategory(event, intent) {
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

        this.parentView.categorySuggestionBuildIU([params]); //AB test : category-suggestion
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
    if (!this.parentView.editing && utils.getUrlParam('subcat') === undefined) {
        this.parentView.scrollSlideTo('#posting-images-view');
    }

    function fetch(done) {
        this.app.fetch({
            fields: {
                model: 'Field',
                params: params
            }
        }, {
            readFromCache: false
        }, done.errfcb);
    }

    function track(done, res) {
        var tracking = new Tracking({}, {
            app: this.app
        });

        tracking.setPage('desktop_step2');
        tracking.generate(onTrackData.bind(this));

        function onTrackData(trackingData) {
            $('#partials-tracking-view').trigger('update', trackingData);
            done(res);
        }
    }

    function success(res) {
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
                if(!$(this).hasClass('image-input-file') && $(this).attr('required') && $(this).attr('id') !== 'field-city' ) {
                    $(this).change();
                }
            });
            this.$el.removeAttr('data-cat-error','true');
        }
    }

    function fail(err) {
        console.log(err); // TODO: HANDLE ERRORS
    }

    asynquence().or(fail.bind(this))
        .then(fetch.bind(this))
        .then(track.bind(this))
        .val(success.bind(this));
}

function onShowCategoryList(event) {
    this.$('.posting-categories-list').fadeIn();
    this.$('#posting-category-suggestion-button').hide();
}

module.exports.id = 'post/categories';
