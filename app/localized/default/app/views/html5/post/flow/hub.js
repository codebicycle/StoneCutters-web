'use strict';

var Base = require('../../../../../../common/app/bases/view');
var translations = require('../../../../../../../../shared/translations');
var _ = require('underscore');
var config = require('../../../../../../../../shared/config');

module.exports = Base.extend({
    className: 'post_flow_hub_view',
    id: 'hub',
    tagName: 'section',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        this.className += (data.item.id) ? ' editing' : ' pending';
        return _.extend({}, data, {
            imagesTemplate: data.template + '/post/flow/hub/images.' + config.getForMarket(this.app.session.get('location').url, ['posting', 'flow', 'hub', 'images'], 'default') + '.html'
        });
    },
    events: {
        'show': 'onShow',
        'hide': 'onHide',
        'click .images .action': 'onImageClick',
        'stepChange': 'onStepChange',
        'click .step:not(".opaque")': 'onStepClick',
        'categoryChange': 'onCategoryChange',
        'descriptionChange': 'onDescriptionChange',
        'optionalsChange': 'onOptionalsChange',
        'contactChange': 'onContactChange',
        'change': 'onChange',
        'click #post:not(".opaque")': 'onSubmit',
        'imagesLoadStart': 'onImagesLoadStart',
        'imagesLoadEnd': 'onImagesLoadEnd'
    },
    onShow: function(event, error) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var translationKey = (this.parentView.getItem().get('id')) ? 'posting_publishbutton.EditYourAd_ZA' : 'misc.CreateYourFreeAd_Mob';

        this.parentView.$el.trigger('headerChange', translations.get(this.app.session.get('selectedLanguage'))[translationKey]);
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
            var category = this.parentView.getCategories().get(id);
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
    onOptionalsChange: function(event, id, subId, errors) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        
        var $step = this.$('#step-categories, #step-optionals').removeClass('success error');
        var $subcategorySummary = this.$('#subcategorySummary').removeClass('success error');
        var failed = false;
        var subcategoryName;
        
        if (id && subId) {
            var category = this.parentView.getCategories().get(id);            
            var subcategories = category.get('children');

            if (subcategories.toJSON) {
                subcategories = subcategories.toJSON();
            }
            subcategoryName = _.find(subcategories, function each(subcategory) {
                return subcategory.id === subId;
            }).trName;
        }
        _.each(this.parentView.getFields().categoryAttributes, function each(field) {
            if (errors[field.name]) {
                failed = true;
                $subcategorySummary.addClass('error').text(errors[field.name] || field.label); // Check for translation since we are just passing the field label as error                 
            }
        }, this);
        
        if (failed) {
            $step.addClass('error');
        }
        else {
            $subcategorySummary.addClass('success').text(subcategoryName);
            $step.addClass('success');
            $step.siblings().removeClass('opaque');
        }
        this.$el.trigger('change');
    },
    onDescriptionChange: function(event, errors) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $step = this.$('#step-description').removeClass('success error');
        var $titleSummary = this.$('#titleSummary').removeClass('success error');
        var $descriptionSummary = this.$('#descriptionSummary').removeClass('success error');
        var failed = false;
        
        _.each(this.parentView.getFields().productDescription, function each(field) {
            var value = this.parentView.getItem().get(field.name);

            if (field.name === 'title') {
                if (errors[field.name] || !value) {
                    failed = true;
                    $titleSummary.addClass('error').text(errors[field.name] || field.label); // Check for translation since we are just passing the field label as error
                }
                else {
                    $titleSummary.addClass('success').text(value);
                }
            }
            else if (field.name === 'description') {
                if (errors[field.name] || !value) {
                    failed = true;
                    $descriptionSummary.addClass('error').text(errors[field.name] || field.label); // Check for translation since we are just passing the field label as error
                }
                else {
                    $descriptionSummary.addClass('success').text(value);
                }
            }
            else if (field.name === 'priceC') {
                if (errors[field.name]) {
                    failed = true;
                }
            }
        }, this);
        if (failed) {
            $step.addClass('error');
        }
        else {
            $step.addClass('success');
        }
        this.$el.trigger('change');
    },
    onContactChange: function(event, errors, cityError) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var item = this.parentView.getItem();
        var location = item.getLocation();
        var user = this.app.session.get('user');
        var $step = this.$('#step-contact').removeClass('success error');
        var $emailSummary = this.$('#emailSummary').removeClass('success error');
        var $locationSummary = this.$('#locationSummary').removeClass('success error');
        var failed = false;

        _.each(this.parentView.getFields().contactInformation, function each(field) {
            var value = item.get(field.name);

            if (field.name === 'email') {
                if (errors[field.name] || !value) {
                    failed = true;
                    $emailSummary.addClass('error').text(errors[field.name] || field.label); // Check for translation since we are just passing the field label as error
                }
                else {
                    $emailSummary.addClass('success').text(typeof value === 'boolean' ? (user ? user.email : '') : value);
                }
            }
            else if (field.name === 'phone') {
                if (errors[field.name]) {
                    failed = true;
                }
            }
        }, this);
        if (!location || !location.url) {
            failed = true;
            $locationSummary.addClass('error').text(cityError);
        }
        else {
            if(location.children && location.children.length > 0){
                location.name = location.children[0].name;
            }
            $locationSummary.addClass('success').text(location.name);
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

        if (this.$('.step.success').length === 3 && !this.$('.images').hasClass('pending')) {
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
    onImagesLoadStart: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$('.images').addClass('pending');
        this.$('.hint small').text(translations.get(this.app.session.get('selectedLanguage'))['posting_photosprogress.wait']);
        this.$el.trigger('change');
    },
    onImagesLoadEnd: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $container = this.$('.images');
        var $display = this.$('.display');
        var $ammount = this.$('.ammount');
        var $key = this.$('.key');
        var $hint = this.$('.hint small');
        var images = this.parentView.getItem().get('images');
        var image = _.find(images, function each(image) {
            return !!image;
        });

        if (image) {
            $container.removeClass('pending').addClass('fill');
            $display.removeClass('r1 r2 r3 r4 r5 r6 r7 r8').addClass('r' + image.orientation).css({
                'background-image': 'url(' + image.url + ')'
            });
        }
        else {
            $container.removeClass('pending fill');
            $display.removeClass('r1 r2 r3 r4 r5 r6 r7 r8').removeAttr('style');
        }

        $hint.text([String.fromCharCode(9733), translations.get(this.app.session.get('selectedLanguage'))['misc.AddPhotosSellFaster_Mob']].join(' '));
        this.$el.trigger('change');
        switch (images.length) {
            case 0:
                $ammount.addClass('hidden').text('');
                $key.text(translations.get(this.app.session.get('selectedLanguage'))['photos.AddPicturesNew']);
                break;
            case 1:
                $key.text(translations.get(this.app.session.get('selectedLanguage'))['posting_fields_1.addAnotherPhoto']);
                break;
            default:
                $ammount.removeClass('hidden').text('+' + (images.length - 1));
                $key.text(translations.get(this.app.session.get('selectedLanguage'))['posting_fields_1.addAnotherPhoto']);
                break;
        }
    }
});

module.exports.id = 'post/flow/hub';
