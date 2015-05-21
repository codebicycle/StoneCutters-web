'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var translations = require('../../../../../../../shared/translations');

module.exports = Base.extend({
    id: 'posting-optionals-view',
    tagName: 'section',
    className: 'posting-optionals-view',
    events: {
        'change': onChange,
        'validate': onValidate,
        'fieldsChange': onFieldsChange
    },
    initialize: initialize,
    getTemplateData: getTemplateData,
    postRender: postRender,
    getRelatedFieldValues: getRelatedFieldValues
});

function initialize() {
    Base.prototype.initialize.call(this);
    this.dictionary = translations.get(this.app.session.get('selectedLanguage'));
}

function getTemplateData() {
    var data = Base.prototype.getTemplateData.call(this);

    return _.extend({}, data, {
        fields: this.fields || [],
        form: this.form,
        optionalsmessage: this.dictionary['messages_site_class.Optional']
    });
}

function postRender() {
    var $fields = this.$('.text-field');
    var $field;

    $fields.each(function() {
        $field = $(this);

        if ($field.val()) {
            $field.trigger('change');
        }
        if ($field.hasClass('type-select') && !$field.find('option').length) {
            $field.parents('.field-wrapper').hide();
        }
    });
}

function onChange(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    var $field = $(event.target);
    var $firstOption = $field.find('option').first();
    
    this.$el.trigger('hideError', [$field]);
    if ($field.data('related')) {
        this.getRelatedFieldValues($field.data('related'), $field.val());
    }
    if ($firstOption.attr('value') === '') {
        $firstOption.remove();
    }
    this.parentView.$el.trigger('fieldSubmit', [$field]);
}

function onValidate(event, done, isValid) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    
    var validationsResults = true;

    _.each(this.fields || [], function each(field) {
        
        var $field = this.$('[name="' + field.name + '"]');
        
        if (field.mandatory === 'true') {
            this.$el.trigger('hideError', [$field]);            
            if (!$field.val()) {
                validationsResults = false;
                this.$el.trigger('showError', [$field, {
                    message: 'postingerror.PleaseCompleteThisField'
                }]);
            }
        }
    }, this);
    done(isValid && validationsResults);
}

function onFieldsChange(event, fields) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    _.each(this.fields || [], function each(field) {
        this.parentView.getItem().unset(field.name);
    }, this);

    this.fields = _.map(fields, function each(field) {
        if (field.fieldType !== 'combobox') {
            return field;
        }
        if (!field.values) {
            field.values = [];
        }
        if (field.values.length) {
            field.values.unshift({
                key: '',
                value: this.dictionary['misc.SelectAnOption_BR']
            });
        }
        return field;
    }, this);

    this.render();
}

function getRelatedFieldValues(related, value) {
    var $field = this.$('[name="' + related + '"]');
    var platform = this.app.session.get('platform');

    function fetch(done) {
        helpers.dataAdapter.get(this.app.req, '/items/fields/' + encodeURIComponent(related) + '/' + value + '/subfields', {
            query: {
                intent: 'post',
                location: this.app.session.get('siteLocation'),
                categoryId: this.parentView.item.get('category').id,
                languageId: this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id,
                platform: platform
            },
        }, done.errfcb);
    }

    function success(res, body) {
        var field = _.find(this.fields, function each(field) {
            return field.name === body.subfield.name;
        }, this);
        var $wrapper = $field.empty().parents('.field-wrapper');
        var value = field.value || {};

        _.extend(field, body.subfield);
        if (!field.values.length) {
            $field.attr('disabled', 'disabled');
            $wrapper.hide();
            return;
        }
        $field.removeAttr('disabled');
        field.values.unshift({
            key: '',
            value: translations.get(this.app.session.get('selectedLanguage'))['misc.SelectAnOption_BR']
        });
        _.each(field.values, function each(option) {
            $field.append('<option value="' + option.key + '"' + (value.key === option.key ? ' selected' : '') + '>' + option.value + '</option>');
        });
        $field.attr('name', field.name);
        $wrapper.show();
    }

    function fail(err) {
        console.log(err); // TODO: HANDLE ERRORS
    }

    asynquence().or(fail.bind(this))
        .then(fetch.bind(this))
        .val(success.bind(this));
}

module.exports.id = 'post/optionals';
