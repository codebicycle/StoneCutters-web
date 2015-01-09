'use strict';

var Base = require('../../../../../../common/app/bases/view');
var translations = require('../../../../../../../../shared/translations');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'post_flow_subcategories_view list disabled',
    id: 'subcategories',
    tagName: 'section',
    events: {
        'show': 'onShow',
        'hide': 'onHide'
    },
    onShow: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.parentView.$el.trigger('headerChange', [translations[this.app.session.get('selectedLanguage') || 'en-US']['misc.ChooseASubcategory_Mob'], this.id, 'categories']);
        this.$el.removeClass('disabled');
        this.$('#category-' + this.parentView.item.get('category').parentId).trigger('show');
    },
    onHide: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$el.addClass('disabled');
        this.$('.category:not(".disabled")').trigger('hide');
    }
});

module.exports.id = 'post/flow/subcategories';
