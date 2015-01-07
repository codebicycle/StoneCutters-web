'use strict';

var Base = require('../../../../../../common/app/bases/view');
var config = require('../../../../../../../../shared/config');
var translations = require('../../../../../../../../shared/translations');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'post_flow_categories_view list disabled',
    id: 'categories',
    tagName: 'section',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
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

        this.parentView.$el.trigger('headerChange', [translations[this.app.session.get('selectedLanguage') || 'en-US']['misc.ChooseACategory_Mob'], this.id]);
        this.$el.removeClass('disabled');
    },
    onHide: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$el.addClass('disabled');
    },
    onClickCategory: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $category = $(event.currentTarget);
        var id = $category.data('id');

        this.parentView.$el.trigger('categoryReset');
        if (this.parentView.item.get('category').parentId !== id) {
            delete this.parentView.item.get('category').id;
            delete this.parentView.item.get('category').name;
        }
        this.parentView.item.get('category').parentId = id;
        this.parentView.$el.trigger('categorySubmit', [translations[this.app.session.get('selectedLanguage') || 'en-US']['postingerror.PleaseSelectCategory'], translations[this.app.session.get('selectedLanguage') || 'en-US']['postingerror.PleaseSelectSubcategory']]);
        this.parentView.$el.trigger('flow', [this.id, 'subcategories']);
    }
});

module.exports.id = 'post/flow/categories';
