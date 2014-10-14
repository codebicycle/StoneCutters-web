'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');
var asynquence = require('asynquence');

module.exports = Base.extend({
    tagName: 'section',
    id: 'posting-categories-view',
    className: 'posting-categories-view wrapper',
    events: {
        'click .child-categories-list a': 'onSubCategoryClick'
    },

    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        return _.extend({}, data, {
            categories: this.parentView.options.categories.toJSON()
        });
    },
    onSubCategoryClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var id = $(event.currentTarget).data('id');

        var fetch = function(done) {
            $('body > .loading').show();
            this.app.fetch({
                fields: {
                    model: 'Field',
                    params: {
                        intent: 'post',
                        location: this.app.session.get('siteLocation'),
                        categoryId: id,
                        languageId: this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id,
                        spike: true
                    }
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var error = function(err) {
            console.log(err); // TODO: HANDLE ERRORS
        }.bind(this);

        var success = function(res) {
            var fields = res.fields.get('fields');

            if (fields) {
                $('#posting-contact-view').trigger('update', [fields.contactInformation]);
            }
        }.bind(this);

        asynquence().or(error)
            .then(fetch)
            .val(success);
    }
});

module.exports.id = 'post/categories';
