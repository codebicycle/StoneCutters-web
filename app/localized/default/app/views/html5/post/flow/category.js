'use strict';

var Base = require('../../../../../../common/app/bases/view');
var config = require('../../../../../../../config');
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

        return _.extend({}, data, {
            subcategories: this.parentView.options.categories.get(this.options.subId).get('children').toJSON()
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
        this.parentView.$el.trigger('subcategorySubmit', [subcategory, 'Debe seleccionar la subcategoria']);
    },
    onClickSubcategory: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $subcategory = $(event.currentTarget);
        var id = $subcategory.data('id');

        var fetchFields = function(done) {
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
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var error = function(err) {
            $('body > .loading').hide();
            console.log(err); // TODO: HANDLE ERRORS
        }.bind(this);

        var success = function(res) {
            var hasOptionals = !!res.fields.get('fields').categoryAttributes.length;

            $('body > .loading').hide();
            if (hasOptionals) {
                this.parentView.$el.trigger('stepChange', ['categories', 'optionals']);
            }
            else {
                this.parentView.$el.trigger('stepChange', ['optionals', 'categories']);
            }
            this.parentView.$el.trigger('flow', [this.$el.attr('id'), hasOptionals ? 'optionals' : '', {
                id: id,
                fields: res.fields
            }]);
        }.bind(this);

        asynquence().or(error)
            .then(fetchFields)
            .val(success);
    }
});

module.exports.id = 'post/flow/category';
