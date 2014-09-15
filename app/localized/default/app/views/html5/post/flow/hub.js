'use strict';

var Base = require('../../../../../../common/app/bases/view');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'post_flow_hub_view',
    id: 'hub',
    tagName: 'section',
    events: {
        'show': 'onShow',
        'hide': 'onHide',
        'click #image': 'onImageClick',
        'stepChange': 'onStepChange',
        'click .step:not(".opaque")': 'onStepClick',
        'categoryChange': 'onCategoryChange',
        'descriptionChange': 'onDescriptionChange',
        'contactChange': 'onContactChange',
        'change': 'onChange',
        'click #post:not(".opaque")': 'onSubmit',
        'restart': 'onRestart',
        'imagesLoadStart': 'onImagesLoadStart',
        'imagesLoadEnd': 'onImagesLoadEnd'
    },
    onShow: function(event, error) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.parentView.$el.trigger('headerChange', 'Crea tu anuncio gratis');
        this.$el.removeClass('disabled');
    },
    onHide: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$el.addClass('disabled');
    },
    onImageClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.parentView.$el.trigger('flow', [this.id, 'images']);
    },
    onStepChange: function(event, before, after) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$('#step-' + before).attr('id', 'step-' + after);
    },
    onStepClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $step = $(event.currentTarget);

        this.parentView.$el.trigger('flow', [this.id, $step.attr('id').split('-').pop()]);
    },
    onCategoryChange: function(event, id, subId, error, subError) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $step = this.$('#step-categories, #step-optionals').removeClass('success error');
        var $categorySummary = this.$('#categorySummary').removeClass('success error');
        var $subcategorySummary = this.$('#subcategorySummary').removeClass('success error');

        if (!id || !subId) {
            $step.addClass('error');
            $step.siblings().addClass('opaque');
        }
        if (id) {
            var category = this.parentView.options.categories.get(id);
            var categoryName = category.get('trName');

            $categorySummary.addClass('success').text(categoryName);
            if (subId) {
                var subcategories = category.get('children');

                if (subcategories.toJSON) {
                    subcategories = subcategories.toJSON();
                }
                
                var subcategoryName = _.find(subcategories, function each(subcategory) {
                    return subcategory.id === subId;
                }).trName;

                $subcategorySummary.addClass('success').text(subcategoryName);
                $step.addClass('success');
                $step.siblings().removeClass('opaque');
            }
            else {
                $subcategorySummary.addClass('error').text(subError);
            }
        }
        else {
            $categorySummary.addClass('error').text(error);
            $subcategorySummary.addClass('error').text(subError);
        }
        this.$el.trigger('change');
    },
    onDescriptionChange: function(event, fields, errors) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $step = this.$('#step-description').removeClass('success error');
        var $titleSummary = this.$('#titleSummary').removeClass('success error');
        var $descriptionSummary = this.$('#descriptionSummary').removeClass('success error');
        var failed = false;
        
        fields.forEach(function each(field) {
            if (field.name === 'title') {
                if (errors[field.name] || !field.value) {
                    failed = true;
                    $titleSummary.addClass('error').text(errors[field.name] || field.label);
                }
                else {
                    $titleSummary.addClass('success').text(field.value);
                }
            }
            else if (field.name === 'description') {
                if (errors[field.name] || !field.value) {
                    failed = true;
                    $descriptionSummary.addClass('error').text(errors[field.name] || field.label);
                }
                else {
                    $descriptionSummary.addClass('success').text(field.value);
                }
            }
        });
        if (failed) {
            $step.addClass('error');
        }
        else {
            $step.addClass('success');
        }
        this.$el.trigger('change');
    },
    onContactChange: function(event, fields, city, errors, cityError) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $step = this.$('#step-contact').removeClass('success error');
        var $emailSummary = this.$('#emailSummary').removeClass('success error');
        var $locationSummary = this.$('#locationSummary').removeClass('success error');
        var failed = false;
        
        fields.forEach(function each(field) {
            if (field.name === 'email') {
                if (errors[field.name] || !field.value) {
                    failed = true;
                    $emailSummary.addClass('error').text(errors[field.name] || field.label);
                }
                else {
                    $emailSummary.addClass('success').text(field.value);
                }
            }
        });
        if (!city || !city.url) {
            failed = true;
            $locationSummary.addClass('error').text(cityError);
        }
        else {
            $locationSummary.addClass('success').text(city.name);
        }
        if (failed) {
            $step.addClass('error');
        }
        else {
            $step.addClass('success');
        }
        this.$el.trigger('change');
    },
    onChange: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (this.$('.step.success').length === 3 && !this.$('#image').hasClass('pending')) {
            this.$('#post').removeClass('opaque');
        }
        else {
            this.$('#post').addClass('opaque');
        }
    },
    onSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.parentView.$el.trigger('submit');
    },
    onRestart: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    },
    onImagesLoadStart: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$('#image').addClass('pending');
        this.$el.trigger('change');
    },
    onImagesLoadEnd: function(event, image) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (image) {
            this.$('#image').removeClass('pending').addClass('fill').css('background-image', 'url(' + image + ')');
        }
        else {
            this.$('#image').removeClass('pending fill').removeAttr('style');
        }
        this.$el.trigger('change');
    }
});

module.exports.id = 'post/flow/hub';
