'use strict';

var Base = require('../../../../../../common/app/bases/view');
var translations = require('../../../../../../../../shared/translations');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'post_flow_subcategories_view list disabled',
    id: 'subcategories',
    tagName: 'section',
    selected: {},
    initialize: function() {
        Base.prototype.initialize.call(this);
        this.selected = {};
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        this.options.categories = data.categories;
        return _.extend({}, data, {});
    },
    events: {
        'show': 'onShow',
        'hide': 'onHide',
        'flow': 'onFlow',
        'subcategorySubmit': 'onSubcategorySubmit',
        'restart': 'onRestart'
    },
    onShow: function(event, category) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.parentView.$el.trigger('headerChange', [translations[this.app.session.get('selectedLanguage') || 'en-US']['misc.ChooseASubcategory_Mob'], this.id, 'categories']);
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

        this.parentView.$el.trigger('subcategorySubmit', [subcategory, translations[this.app.session.get('selectedLanguage') || 'en-US'][error]]);
    },
    onRestart: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.selected = {};
    }
});

module.exports.id = 'post/flow/subcategories';
