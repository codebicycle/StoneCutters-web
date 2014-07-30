'use strict';

var Base = require('../../../../../../common/app/bases/view');
var config = require('../../../../../../../config');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'post_flow_categories_view list disabled',
    id: 'categories',
    tagName: 'section',
    getTemplateData: function() {
        var data = this.parentView.getTemplateData.call(this);
        var categories = this.app.fetcher.collectionStore.get('categories', {
            location: this.app.session.get('siteLocation'),
            languageId: this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id
        });
        var icons = config.get(['icons', this.app.session.get('platform')], []);

        if (categories) {
            categories = categories.toJSON();
        }
        return _.extend({}, data, {
            categories: categories || [],
            icons: icons
        });
    },
    postRender: function() {
        this.$el.html(this.getInnerHtml());
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
        var categoryId = $category.data('id');

        this.parentView.$el.trigger('flow', [$category.parent().data('title'), this.id, 'category-' + categoryId, categoryId]);
    }
});

module.exports.id = 'post/flow/categories';
