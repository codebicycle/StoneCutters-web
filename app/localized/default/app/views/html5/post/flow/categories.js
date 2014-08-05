'use strict';

var Base = require('../../../../../../common/app/bases/view');
var config = require('../../../../../../../config');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'post_flow_categories_view list disabled',
    id: 'categories',
    tagName: 'section',
    selected: {},
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            categories: this.parentView.options.categories.toJSON(),
            icons: config.get(['icons', this.app.session.get('platform')], [])
        });
    },
    events: {
        'show': 'onShow',
        'hide': 'onHide',
        'click .category': 'onClickCategory'
    },
    onShow: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.parentView.$el.trigger('headerChange', ['Elige una categoria', this.id]);
        this.$el.removeClass('disabled');
    },
    onHide: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$el.addClass('disabled');
        this.parentView.$el.trigger('categorySubmit', [this.selected, 'Debe seleccionar la categoria']);
    },
    onClickCategory: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $category = $(event.currentTarget);

        this.selected.id = $category.data('id');
        this.parentView.$el.trigger('flow', [this.id, 'subcategories', this.selected]);
    }
});

module.exports.id = 'post/flow/categories';
