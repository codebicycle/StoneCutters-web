'use strict';

var Base = require('../../../../../../common/app/bases/view');
var config = require('../../../../../../../config');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'post_flow_subcategories_view list disabled',
    id: 'subcategories',
    tagName: 'section',
    selected: {},
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        this.options.categories = this.parentView.options.categories;
        return _.extend({}, data, {
            categories: this.options.categories.toJSON()
        });
    },
    events: {
        'show': 'onShow',
        'hide': 'onHide',
        'flow': 'onFlow',
        'subcategorySubmit': 'onSubcategorySubmit'
    },
    onShow: function(event, category) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.parentView.$el.trigger('headerChange', ['Elige una subcategoria', this.id, 'categories']);
        this.$el.removeClass('disabled');
        this.$('#category-' + category.id).trigger('show');
    },
    onHide: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$el.addClass('disabled');
        this.$('.category:not(".disabled")').trigger('hide', this.selected);
    },
    onFlow: function(event, from, to, subcategory) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.selected = subcategory;
        this.parentView.$el.trigger('flow', [this.id, to, this.selected]);
    },
    onSubcategorySubmit: function(event, subcategory, error) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.parentView.$el.trigger('subcategorySubmit', [subcategory, error]);
    }
});

module.exports.id = 'post/flow/subcategories';
