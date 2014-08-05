'use strict';

var Base = require('../../../../../../common/app/bases/view');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'post_flow_hub_view',
    id: 'hub',
    events: {
        'show': 'onShow',
        'hide': 'onHide',
        'click .step:not(".opaque")': 'onClickStep',
        'categoryChange': 'onCategoryChange',
        'descriptionChange': 'onDescriptionChange',
        'contactChange': 'onContactChange',
        'change': 'onChange',
        'click #post': 'onSubmit'
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
    onClickStep: function(event) {
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

        var $step = this.$('#step-categories').removeClass('success error');
        var message = error;
        var subMessage = subError;
        var category;

        if (!id || !subId) {
            $step.addClass('error');
            $step.siblings().addClass('opaque');
        }
        if (id) {
            category = this.parentView.options.categories.get(id);
            message = category.get('trName');
            if (subId) {
                var subcategories = category.get('children');

                if (subcategories.toJSON) {
                    subcategories = subcategories.toJSON();
                }
                subMessage = _.find(subcategories, function each(subcategory) {
                    return subcategory.id === subId;
                }).trName;
                $step.addClass('success');
                $step.siblings().removeClass('opaque');
            }
        }
        if (subMessage) {
            message += '<br/>' + subMessage;
        }
        $step.find('.title').html(message);
        this.$el.trigger('change');
    },
    onDescriptionChange: function(event, fields, errors) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $step = this.$('#step-description').removeClass('success error');
        var failed = false;
        var message;
        var subMessage;

        fields.forEach(function each(field) {
            if (field.name === 'title') {
                if (errors[field.name] || !field.value) {
                    failed = true;
                    message = errors[field.name] || field.label;
                }
                else {
                    message = field.value;
                }
            }
            else if (field.name === 'description') {
                if (errors[field.name] || !field.value) {
                    failed = true;
                    subMessage = errors[field.name] || field.label;
                }
                else {
                    subMessage = field.value;
                }
            }
        });
        if (failed) {
            $step.addClass('error');
        }
        else {
            $step.addClass('success');
        }
        $step.find('.title').html(message + '<br/>' + subMessage);
        this.$el.trigger('change');
    },
    onContactChange: function(event, fields, errors) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $step = this.$('#step-contact').removeClass('success error');
        var failed = false;
        var message;
        var subMessage;

        fields.forEach(function each(field) {
            if (field.name === 'email') {
                if (errors[field.name] || !field.value) {
                    failed = true;
                    message = errors[field.name] || field.label;
                }
                else {
                    message = field.value;
                }
            }
        });
        if (failed) {
            $step.addClass('error');
        }
        else {
            $step.addClass('success');
        }
        $step.find('.title').html(message + '<br/>' + (subMessage || ''));
        this.$el.trigger('change');
    },
    onChange: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (this.$('.step.success').length === 3) {
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
    }
});

module.exports.id = 'post/flow/hub';
