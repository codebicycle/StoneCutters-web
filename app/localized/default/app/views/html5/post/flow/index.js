'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var Base = require('../../../../../../common/app/bases/view').requireView('post/flow/index');
var helpers = require('../../../../../../../helpers');
var translations = require('../../../../../../../../shared/translations');
var Item = require('../../../../../../../models/item');
var Field = require('../../../../../../../models/field');
var Categories = require('../../../../../../../collections/categories');
var Cities = require('../../../../../../../collections/cities');
var States = require('../../../../../../../collections/states');

window.URL = window.URL || window.webkitURL;

function onpopstate(event) {
    var $loading = $('body > .loading');
    var status = ($loading.is(":visible")) ? false : confirm(event.data.message);

    if (status) {
        $(window).off('popstate', onpopstate);
        history.back();
    }
    else {
        history.pushState(null, '', window.location.pathname + window.location.search);
    }
}

module.exports = Base.extend({
    errors: {},
    initialize: function() {
        Base.prototype.initialize.call(this);
        this.errors = {};
        this.currentViewName = 'hub';
        this.dictionary = translations.get(this.app.session.get('selectedLanguage'));
        this.neighborhoodSelected = false;
    },
    postRender: function() {
        $(window).on('beforeunload', this.onBeforeUnload);
        $(window).on('unload', {
            async: false
        }, this.onExit.bind(this));
        this.app.router.once('action:end', this.onStart);
        this.app.router.once('action:start', this.onEnd);
        this.attachTrackMe(function trackMe(category, action) {
            return {
                custom: [category, this.getItem().get('category').parentId || '-', this.getItem().get('category').id || '-', action].join('::')
            };
        }.bind(this));
        if (this.getItem().has('id')) {
            this.$el.trigger('categorySubmit', {
                id: this.item.get('category').parentId
            });
            this.$el.trigger('subcategorySubmit');
            this.$el.trigger('descriptionSubmit', [{}, true]);
            this.$el.trigger('contactSubmit', [{}, '', true]);
            this.$('#hub').trigger('imagesLoadEnd');
            this.$('#images').trigger('preloadImages', [this.getItem().get('images')]);
        }
        this.getCategories();
    },
    onBeforeUnload: function(event) {
        return ' ';
    },
    onStart: function(event) {
        this.appView.trigger('postingflow:start');
    },
    onEnd: function(event) {
        $(window).off('beforeunload', this.onBeforeUnload);
        $(window).off('popstate', onpopstate);
        this.currentView.$el.trigger('exit');
        this.appView.trigger('postingflow:end');
    },
    events: {
        'flow': 'onFlow',
        'headerChange': 'onHeaderChange',
        'categorySubmit': 'onCategorySubmit',
        'subcategorySubmit': 'onSubcategorySubmit',
        'optionalsSubmit': 'onOptionalsSubmit',
        'descriptionSubmit': 'onDescriptionSubmit',
        'contactSubmit': 'onContactSubmit',
        'locationSubmit': 'onLocationSubmit',
        'submit': 'onSubmit',
        'trackEventNext': 'onNext',
        'exit': 'onExit',
        'imagesLoadStart': 'onImagesLoadStart',
        'imagesLoadEnd': 'onImagesLoadEnd',
        'categoryReset': 'onCategoryReset',
        'errors': 'onErrors',
        'mousedown select': 'changeSelectValue',
        'touchstart select': 'changeSelectValue',
        'click .migration-banner-bd': 'onMigrationBannerBdClick'
    },
    onMigrationBannerBdClick: function(event) {
        event.preventDefault();
        $(window).off('beforeunload', this.onBeforeUnload);
        $(window).off('popstate', onpopstate);
        window.location.href = event.currentTarget.href;
    },
    changeSelectValue: function(event){
        var select = $(event.target);

        if (select.children().length === 2) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            select.val(select.find('option:not(:selected)').val());
            select.trigger('change');
        }

    },
    onFlow: function(event, from, to, data) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.currentViewName = (to || 'hub');
        this.$('#' + this.currentViewName).trigger('show', data || {});
        this.$('#' + from).trigger('hide', data || {});
        this.$el.scrollTop();
        if (!this.edited) {
            this.handleBack();
        }
    },
    handleBack: function() {
        this.edited = true;
        history.pushState(null, '', window.location.pathname + window.location.search);
        $(window).on('popstate', {
            message: this.dictionary['misc.WantToGoBack']
        }, onpopstate);
    },
    onHeaderChange: function(event, title, current, back, data) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$('header').trigger('change', [title, current, back || 'hub', data]);
    },
    onCategorySubmit: function(event, error, subError) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.errors['category.parentId'] = error;
        this.errors['category.id'] = subError;
        this.$('#hub').trigger('categoryChange', [this.item.get('category').parentId, this.item.get('category').id, this.errors['category.parentId'], this.errors['category.id']]);
    },
    onSubcategorySubmit: function(event, error) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.errors['category.id'] = error;
        this.$('#hub').trigger('categoryChange', [this.item.get('category').parentId, this.item.get('category').id, this.errors['category.parentId'], this.errors['category.id']]);
        this.$('#hub').trigger('stepChange', this.getFields().categoryAttributes.length ? ['categories', 'optionals'] : ['optionals', 'categories']);
        this.$('#optionals').trigger('fieldsChange', true);
        this.$('#description').trigger('fieldsChange');
        this.$('#contact').trigger('fieldsChange');
    },
    onOptionalsSubmit: function(event, errors) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$('#hub').trigger('optionalsChange', [this.item.get('category').parentId, this.item.get('category').id, errors]);
        
    },
    onDescriptionSubmit: function(event, errors, notTrack) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$('#hub').trigger('descriptionChange', [errors]);
        if (!notTrack) {
            this.$el.trigger('trackEventNext', ['ClickDescribeAdNext']);
        }
    },
    onContactSubmit: function(event, errors, cityError, notTrack) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$('#hub').trigger('contactChange', [errors, cityError]);
        if (!notTrack) {
            this.$el.trigger('trackEventNext', ['ClickContactInfoNext']);
        }
    },
    onLocationSubmit: function(event, error) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$('#contact').trigger('locationChange', [error, this.neighborhoodSelected]);
    },
    onSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $loading = $('body > .loading').show();
        var editing = this.getItem().has('id');

        this.item.set('languageId', this.app.session.get('languageId'));
        this.item.set('platform', this.app.session.get('platform'));
        this.item.set('ipAddress', this.app.session.get('ip'));
        this.$('#errors').trigger('hide');

        asynquence().or(fail.bind(this))
            .then(post.bind(this))
            .val(success.bind(this));

        function post(done) {
            this.item.post(done);
        }

        function success() {
            var category = 'Posting';
            var action = (editing ? 'Edit' : 'Posting') + 'Success';

            this.track({
                category: category,
                action: action,
                custom: [category, this.item.get('category').parentId || '-', this.item.get('category').id || '-', action, this.item.get('id')].join('::')
            });
            this.app.router.once('action:end', always);
            helpers.common.redirect.call(this.app.router, ['/', (editing ? 'edititem' : 'posting'), '/success/', this.item.get('id'), '?sk=', this.item.get('securityKey')].join(''), null, {
                status: 200
            });
        }

        function fail(errors) {
            // TODO: Improve error handling
            if (errors) {
                if (errors.responseText) {
                    errors = JSON.parse(errors.responseText);
                }
                if (_.isArray(errors)) {
                    this.$el.trigger('errors', [errors]);
                }
            }
            always();
        }

        function always() {
            $loading.hide();
        }
    },
    onNext: function(event, action) {
        var category = 'Posting';

        this.track({
            category: category,
            action: action,
            custom: [category, this.getItem().get('category').parentId || '-', this.getItem().get('category').id || '-', action].join('::')
        });
    },
    onExit: function(event) {
        var category = 'Posting';
        var action = 'DropSection';
        var item = this.getItem();
        var location = item.getLocation() || this.app.session.get('location').current || this.app.session.get('location');
        var status = [];

        status.push('section:' + this.currentViewName);
        status.push('category:' + (item.get('category').parentId ? 1 : 0));
        status.push('subcategory:' + (item.get('category').id ? 1 : 0));
        status.push('title:' + (item.get('item') ? 1 : 0));
        status.push('description:' + (item.get('description') ? 1 : 0));
        status.push('email:' + (item.get('email') ? 1 : 0));
        status.push('state:' + (location.url ? 1 : 0));
        status.push('city:' + (location.url ? 1 : 0));
        status.push('pictures:' + item.get('images').length);

        this.track({
            category: category,
            action: action,
            custom: [category, item.get('category').parentId || '-', item.get('category').id || '-', action].concat(status).join('::')
        }, {
            async: (event.data && !_.isUndefined(event.data.async) ? event.data.async : true)
        });
    },
    onImagesLoadStart: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$('#hub').trigger('imagesLoadStart');
    },
    onImagesLoadEnd: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$('#hub').trigger('imagesLoadEnd');
    },
    onCategoryReset: function(event) {
        this.$('#hub').trigger('stepChange', ['optionals', 'categories']);
    },
    onErrors: function(event, errors) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$('#errors').trigger('show', [errors]);
    },
    getItem: function() {
        this.item = this.item || (this.options.item && this.options.item.toJSON ? this.options.item : new Item(this.options.item || {}, {
            app: this.app
        }));
        return this.item;
    },
    getFields: function() {
        this.fields = this.fields || (this.options.fields && this.options.fields.toJSON ? this.options.fields : new Field(this.options.fields || {}, {
            app: this.app
        }));
        return this.fields.get('fields');
    },
    getCategories: function() {
        this.categories = this.categories || (this.options.categories && this.options.categories.toJSON ? this.options.categories : new Categories(this.options.categories || {}, {
            app: this.app
        }));
        return this.categories;
    },
    getTopCities: function() {
        this.topCities = this.topCities || (this.options.topCities && this.options.topCities.toJSON ? this.options.topCities : new Cities(this.options.topCities || {}, {
            app: this.app
        }));
        return this.topCities;
    },
    getStates: function() {
        this.states = this.states || (this.options.states && this.options.states.toJSON ? this.options.states : new States(this.options.states || {}, {
            app: this.app
        }));
        return this.states;
    }
});
