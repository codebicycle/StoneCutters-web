'use strict';

var Base = require('../../../../../../common/app/bases/view');
var translations = require('../../../../../../../../shared/translations');
var helpers = require('../../../../../../../helpers');
var asynquence = require('asynquence');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'post_flow_optionals_view disabled',
    tagName: 'section',
    id: 'optionals',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var categories = data.categories.search ? data.categories : this.parentView.getCategories();
        var item = this.parentView.getItem ? this.parentView.getItem() :  undefined;
        var category = item ? categories.search(item.get('category').parentId) : undefined;
        var subcategory = item ? categories.search(item.get('category').id) : undefined;

        return _.extend({}, data, {
            fields: this.fields || [],
            category: category ? category.toJSON() : {},
            subcategory: subcategory ? subcategory.toJSON() : {},
            form: {
                values: item ? _.object(_.map(item.get('optionals'), function each(optional) {
                    return optional.name;
                }, this), _.map(item.get('optionals'), function each(optional) {
                    return optional.id || optional.value;
                }, this)) : {}
            }
        });
    },
    postRender: function() {
        if (!this.firstRender) {
            return;
        }
        this.firstRender = false;
        _.each(this.fields || [], function each(field) {
            if (!field.related) {
                return;
            }
            this.$('[name="' + field.name + '"]').trigger('change');
        }, this);
    },
    events: {
        'show': 'onShow',
        'hide': 'onHide',
        'click .changeCategory': 'onChangeCategoryClick',
        'click .changeSubcategory': 'onChangeSubcategoryClick',
        'fieldsChange': 'onFieldsChange',
        'change': 'onChange',
        'submit': 'onSubmit'
    },
    onShow: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.parentView.$el.trigger('headerChange', [translations.get(this.app.session.get('selectedLanguage'))['misc.ChooseACategory_Mob'], this.id, '']);
        this.$el.removeClass('disabled');
    },
    onHide: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$el.addClass('disabled');
    },
    onChangeCategoryClick: function(event) {
        this.parentView.$el.trigger('flow', [this.id, 'categories']);
    },
    onChangeSubcategoryClick: function(event) {
        this.parentView.$el.trigger('flow', [this.id, 'subcategories']);
    },
    onFieldsChange: function(event, firstRender) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var show = !this.$el.hasClass('disabled');
        var related = [];
        var names = [];
        var name;

        this.firstRender = !!firstRender;
        this.parentView.getFields().categoryAttributes.forEach(function each(field) {
            names.push(field.name);
            if (field.related) {
                related.push(field.related);
            }
        });
        this.fields = this.parentView.getFields().categoryAttributes.filter(function each(field) {
            return !_.contains(related, field.name) || field.fieldType !== 'combobox' || (field.values && field.values.length);
        });
        this.parentView.getItem().set('optionals', _.filter(this.parentView.getItem().get('optionals'), function each(optional) {
            return _.contains(names, optional.name);
        }, this));
        this.render();
        if (show) {
            this.$el.trigger('show');
        }
    },
    onChange: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $loading = $('body > .loading');
        var $field = $(event.target);
        var name = $field.attr('name');
        var field = _.clone(_.find(this.fields, function each(field) {
            return field.name === name;
        }));
        var index = this.parentView.item.indexOfOptional(field.name);

        field.value = $field.val();
        if (index === undefined) {
            index = this.parentView.item.get('optionals').length;
        }
        this.parentView.item.get('optionals')[index] = field;
        if (!field.related) {
            return;
        }
        asynquence().or(error.bind(this))
            .then(fetch.bind(this))
            .val(success.bind(this));

        function fetch(done) {
            $loading.show();
            helpers.dataAdapter.get(this.app.req, '/items/fields/' + encodeURIComponent(field.related) + '/' + field.value + '/subfields', {
                query: {
                    intent: 'post',
                    location: this.app.session.get('siteLocation'),
                    categoryId: this.parentView.getItem().get('category').id,
                    languageId: this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id
                }
            }, done.errfcb);
        }

        function success(res, body) {
            var index;

            $loading.hide();
            _.each(this.parentView.getFields().categoryAttributes, function each(field, i) {
                if (field.name === body.subfield.name) {
                    index = i;
                }
            }, this);
            this.parentView.getFields().categoryAttributes[index] = body.subfield;
            this.$el.trigger('fieldsChange');
        }

        function error(err) {
            $loading.hide();
            console.log(err); // TODO: HANDLE ERRORS
        }
    },
    onSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        
        if (this.validate()) {
            this.parentView.$el.trigger('flow', [this.id, '']);
        }
    },
    validate: function() {
        var validationResults = true;
        
        this.$el.removeClass('error').find('small').remove();
        
        _.each(this.parentView.getFields().categoryAttributes, function each(field, i) {
           var $field = this.$('[name="'+field.name+'"]');
            $field.removeClass('error');
            if (field.mandatory === 'true') {
                this.$el.trigger('hideError', [$field]);            
                if (!$field.val()) {
                    validationResults = false;
                    this.$el.addClass('error');
                    $field.addClass('error').after('<small class="error">' + translations.get(this.app.session.get('selectedLanguage'))['postingerror.PleaseCompleteThisField'] + '</small>');
                }
            }
        }, this);

        return validationResults;
    }
});

module.exports.id = 'post/flow/optionals';
