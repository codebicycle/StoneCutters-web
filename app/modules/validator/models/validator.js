'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var Backbone = require('backbone');
var Validation = require('./validation');
var Validations = require('../collections/validations');
var helpers = require('../../../helpers');
var utils = require('../../../../shared/utils');
var config = require('../../../../shared/config');
var Base;

Backbone.noConflict();
Base = Backbone.Model;

function initialize(attrs, options) {
    this.options = options || {};
    this.app = this.options.app;
    if (attrs && !(attrs.validations instanceof Backbone.Collection)) {
        this.set({
            validations: new Validations(attrs.validations || [], options)
        });
    }
}

function getValidations() {
    if (!this.has('validations')) {
        this.set({
            validations: new Validations([], this.options)
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
    validation.set(_.omit(options, 'rules'));
    rules = _.isArray(options.rules) ? options.rules : [options.rules];
    validation.pushRule(rules);
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
    var promise;

    if (_.isFunction(fields)) {
        callback = fields;
        fields = [];
        options = {};
    }
    if (_.isFunction(options)) {
        callback = options;
        options = {};
    }
    if (!fields) {
        fields = [];
    }
    options = _.defaults({}, options || {}, {
        isSubmit: this.get('isSubmit')
    });
    fields = _.map(_.isArray(fields) ? fields : [fields], function eachFields(field) {
        return _.isString(field) ? field : (field.attr('name') || field.attr('id'));
    });
    
    this.unset('details');
    if (!validations.length) {
        return callback(null, true);
    }

    promise = asynquence(true).or(fail.bind(this));
    validations.each(function each(validation) {
        if (fields.length && !_.contains(fields, validation.get('id'))) {
            return true;
        }
        promise.then(function validateRule(next, isValid) {
            this.run(validation, options, function runRule(isValidField) {
                if (options.stopOnFail && !isValidField) {
                    next.abort();
                    return callback(null, false);
                }
                next(isValid && isValidField);
            });
        }.bind(this));
    }, this);
    promise.val(success.bind(this));

    function success(isValid) {
        callback(null, isValid);
    }

    function fail(err) {
        callback(err);
    }
}

function run(validation, options, done) {
    var $field = validation.get('field');
    var val = validation.val();
    var required;
    var promise;

    validation.trigger('start');
    if (validation.has('required')) {
        required = validation.get('required');
        if (!val || (required.value && required.value === val)) {
            validation.trigger('end', false);
            this.pushDetail(validation.get('id'), required.message);
            return done(false);
        }
    }

    promise = asynquence(true).or(fail.bind(this));
    validation.getRules().each(function each(rule) {
        if (options.excludeRules && _.contains(options.excludeRules, rule.get('id'))) {
            return;
        }
        if (options.includeRules && !_.contains(options.includeRules, rule.get('id'))) {
            return;
        }
        promise.then(function execRule(next, isValid) {
            rule.exec(val, validation, options, function callback(isValidRule) {
                if (!isValidRule) {
                    this.pushDetail(validation.get('id'), rule.get('message'), rule.get('className'));
                }
                next(isValidRule);
            }.bind(this));
        }.bind(this));
    }, this);
    promise.val(success.bind(this));

    function success(isValid) {
        validation.trigger('end', isValid);
        done(isValid);
    }

    function fail(err) {
        validation.trigger('fail', err);
        done(true);
    }
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

    return this.getDetails()[$field.attr('name') || $field.attr('id')];
}

function pushDetail(id, message, className) {
    var details = this.getDetails();
    var detail = details[id] || [];

    detail.push({
        message: message,
        className: className
    });
    details[id] = detail;
}

function isEnabled(options) {
    return config.getForMarket(this.app.session.get('location').url, ['validator', 'enabled'], true);
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
