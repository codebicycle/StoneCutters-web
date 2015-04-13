'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var Validation = require('./validation');
var utils = require('../../../../shared/utils');
var Base;

Backbone.noConflict();
Base = Backbone.Model;

function initialize(attrs, options) {
    this.options = options || {};
    this.app = this.options.app;
    if (attrs && !(attrs.validations instanceof Backbone.Collection)) {
        this.set({
            validations: new Collection(attrs.validations || [], options)
        });
    }
}

function getValidations() {
    if (!this.has('validations')) {
        this.set({
            validations: new Collection([], this.options)
        });
    }
    return this.get('validations');
}

function register(field, options, reset) {
    var $field = $(field);
    var validations = this.getValidations();
    var id = $field.attr('name') || $field.attr('id');
    var validation = validations.get(id);
    var rules;

    if (validation && reset) {
        validations.remove(validation);
        validation = null;
    }
    if (!validation) {
        validation = new Validation({
            id: id,
            field: $field,
            rules: []
        }, {
            app: this.app,
            collection: validations
        });
        validations.push(validation);
    }
    rules = _.isArray(options.rules) ? options.rules : [options.rules];
    validation.set(_.extend({}, _.omit(options, 'rules'), {
        rules: rules
    });
}

function unregister(field, unregisterRules) {
    var $field = $(field);
    var validations = this.getValidations();
    var id = $field.attr('name') || $field.attr('id');
    var validation = validations.get(id);
    var rules;

    if (validation) {
        if (!unregisterRules) {
            return validations.remove(validation);
        }
        rules = validation.getRules().filter(function filter(rule) {
            return !_.contains(unregisterRules, rule.get('id'));
        });
        validation.getRules().reset(rules);
    }
}

function validate(fields, options, callback) {
    var validations = this.getValidations();
    var failed;

    if (_.isFuntion(fields)) {
        callback = fields;
        fields = [];
        options = {};
    }
    if (_.isFuntion(options)) {
        callback = options;
        options = {};
    }
    if (!fields) {
        fields = [];
    }
    options = options || {};
    fields = _.isArray(fields) ? fields : [fields];
    
    this.unset('details');
    if (!validations.length) {
        return true;
    }
    validations.find(function each(validation) {
        if (fields.length && !_.contains(fields, validation.get('id'))) {
            return true;
        }
        failed = this.run(validation, options);
        if (options.stopOnFail && failed) {
            return true;
        }
        return false;
    }, this);
    (callback || utils.noop)(!failed);
    return !failed;
}

function run(validation, options) {
    var $field = validation.get('field');
    var val = validation.val();
    var required;
    var failed;

    validation.trigger('start');
    if (validation.has('required')) {
        required = validation.get('required');
        if (!val || (required.value && required.value === val)) {
            this.pushDetail(validation.get('id'), required.message);
            return false;
        }
    }
    validation.getRules().each(function each(rule) {
        if (options.excludeRules && _.contains(options.excludeRules, rule.get('id'))) {
            return;
        }
        if (options.includeRules && !_.contains(options.includeRules, rule.get('id'))) {
            return;
        }
        failed = !rule.exec(val, $field, validation, options);
        if (failed) {
            this.pushDetail(validation.get('id'), rule.get('message'));
        }
    }, this);
    validation.trigger('end', !failed);
    return !failed;
}

function getDetails() {
    if (!this.has('details')) {
        this.set({
            details: {}
        });
    }
    return this.get('details');
}

function details(field) {
    var $field = $(field);

    return this.getDetails()[$field.attr('name') || $field.attr('id')]
}

function pushDetail(id, detail) {
    var details = this.getDetails();
    var detail = details[id] || [];

    detail.push(detail);
    details[id] = detail;
}

function isEnabled(options) {
    return helpers.features.isEnabled.call(this, 'validator');
}

module.exports = Base.extend({
    initialize: initialize,
    getValidations: getValidations,
    register: register,
    unregister: unregister,
    validate: validate,
    run: run,
    getDetails: getDetails,
    details: details,
    pushDetail: pushDetail,
    isEnabled: isEnabled
});
