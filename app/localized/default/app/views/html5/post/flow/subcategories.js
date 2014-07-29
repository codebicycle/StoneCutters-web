'use strict';

var Base = require('../../../../../../common/app/bases/view');
var config = require('../../../../../../../config');
var _ = require('underscore');
var asynquence = require('asynquence');

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
        'click .subcategory': 'onClickSubcategory'
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
