'use strict';

var Base = require('../../../../../../common/app/bases/view');
var config = require('../../../../../../../config');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'post_flow_subcategories_view disabled',
    id: 'subcategories',
    tagName: 'section',
    getTemplateData: function() {
        var data = this.parentView.getTemplateData.call(this);
        var categories = this.app.fetcher.collectionStore.get('categories', {
            location: this.app.session.get('siteLocation'),
            languageId: this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id
        });

        if (categories) {
            categories = categories.toJSON();
        }
        return _.extend({}, data, {
            categories: categories || []
        });
    },
    postRender: function() {
        this.$el.html(this.getInnerHtml());
    },
    events: {
        'show': 'onShow',
        'hide': 'onHide',
        'click .subcategory': 'onClickSubcategory'
    },
    onShow: function(event, categoryId) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$el.removeClass('disabled');
        this.$('ul.list').addClass('disabled');
        this.$('#category-' + categoryId).removeClass('disabled');
    },
    onHide: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$el.addClass('disabled');
    },
    onClickSubcategory: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $subcategory = $(event.currentTarget);
        var $category = $subcategory.parent();

        this.parentView.$el.trigger('flow', [$category.data('title'), $category.attr('id')]);
    }
});

module.exports.id = 'post/flow/subcategories';
