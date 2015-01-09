'use strict';

var Base = require('../../../../../../common/app/bases/view');
var translations = require('../../../../../../../../shared/translations');
var asynquence = require('asynquence');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'post_flow_category_view category disabled',
    tagName: 'ul',
    id: function() {
        return 'category-' + this.options.subId;
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var subcategories = data.categories.get(this.options.subId || this.options.subid).get('children');

        return _.extend({}, data, {
            subcategories: subcategories.toJSON ? subcategories.toJSON() : subcategories
        });
    },
    postRender: function() {
        this.$el.data('id', this.options.subId);
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
    },
    onHide: function(event, subcategory) {
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
        var id = $subcategory.data('id');

        var fetch = function(done) {
            $('body > .loading').show();
            this.app.fetch({
                fields: {
                    model: 'Field',
                    params: {
                        intent: 'post',
                        location: this.app.session.get('siteLocation'),
                        categoryId: id,
                        languageId: this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id
                    }
                }
            }, done.errfcb);
        }.bind(this);

        var error = function(err) {
            $('body > .loading').hide();
            console.log(err); // TODO: HANDLE ERRORS
        }.bind(this);

        var success = function(res) {
            $('body > .loading').hide();
            this.parentView.parentView.fields = res.fields;
            this.parentView.parentView.item.get('category').id = id;
            this.parentView.$el.trigger('subcategorySubmit', [translations[this.app.session.get('selectedLanguage') || 'en-US']['postingerror.PleaseSelectSubcategory']]);
            this.parentView.$el.trigger('flow', [this.$el.attr('id'), res.fields.get('fields').categoryAttributes.length ? 'optionals' : '']);
        }.bind(this);

        asynquence().or(error)
            .then(fetch)
            .val(success);
    }
});

module.exports.id = 'post/flow/category';
