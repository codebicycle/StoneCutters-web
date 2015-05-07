'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var Base = require('../../../../../common/app/bases/view');
var config = require('../../../../../../../shared/config');
var translations = require('../../../../../../../shared/translations');

module.exports = Base.extend({
    id: 'posting-locations-view',
    tagName: 'section',
    className: 'posting-locations-view',
    selectors: {
        state: '#field-state',
        city: '#field-city',
        neighborhood: '#field-neighborhood'
    },
    events: {
        'validate': onValidate,
        'formRendered': onFormRendered,
        'change #field-state': onChangeState,
        'change #field-city': onChangeCity,
        'change #field-neighborhood': onChangeNeighborhood
    },
    initialize: initialize,
    getTemplateData: getTemplateData,
    postRender: postRender,
    isMandatory: isMandatory,
    findCities: findCities,
    findNeighborhoods: findNeighborhoods,
    findLocation: findLocation,
    getNeighborhood: getNeighborhood,
    resetNeighborhoods: resetNeighborhoods,
    addEmptyOption: addEmptyOption,
    getItem: getItem,
    validateLocation: validateLocation
});

function initialize() {
    Base.prototype.initialize.call(this);
    this.dictionary = translations.get(this.app.session.get('selectedLanguage'));
}

function getTemplateData() {
    var data = Base.prototype.getTemplateData.call(this);
    var states = data.states ? data.states.toJSON() : [];
    var cities = data.cities ? data.cities.toJSON() : [];
    var neighborhoods = data.neighborhoods ? data.neighborhoods.toJSON() : [];
    var location = data.currentLocation;
    var sorted;

    if (states && states.length) {
        states = _.map(_.sortBy(states, 'name'), eachLocation.bind(this, 'url'));
    }
    if (!location.state) {
        this.addEmptyOption(states, 'countryoptions.Home_SelectState');
    }
    if (cities && cities.length) {
        cities = _.map(_.sortBy(cities, 'name'), eachLocation.bind(this, 'url'));
    }
    if (!location.city) {
        this.addEmptyOption(cities, 'countryoptions.Home_SelectCity');
    }
    if (neighborhoods && neighborhoods.length) {
        neighborhoods = _.map(_.sortBy(neighborhoods, 'name'), eachLocation.bind(this, 'id'));
    }
    if (!location.neighborhood) {
        this.addEmptyOption(neighborhoods, (this.app.session.get('location').abbreviation !== 'ZA') ? 'item.SelectA_Neighborhood' : 'misc.SelectSuburb');
    }
    return _.extend({}, data, {
        states: states,
        cities: cities,
        neighborhoods: neighborhoods,
        location: _.object(_.keys(location), _.map(location, function each(location) {
            return location.url || location.id;
        }))
    });
}

function postRender() {
    var $state = this.$(this.selectors.state);
    var $city = this.$(this.selectors.city);
    var $neighborhood = this.$(this.selectors.neighborhood);

    if (this.isMandatory('state')) {
        this.parentView.$el.trigger('fieldValidationRegister', [$state, {
            required: {
                message: 'countryoptions.Home_SelectState'
            }
        }, true]);
    }

    if (this.isMandatory('city')) {
        this.parentView.$el.trigger('fieldValidationRegister', [$city, {
            required: {
                message: 'countryoptions.Home_SelectCity'
            }
        }, true]);
    }

    if (this.isMandatory('neighborhoods')) {
        this.parentView.$el.trigger('fieldValidationRegister', [$neighborhood, {
            rules: [{
                id: 'required',
                message: (this.app.session.get('location').abbreviation !== 'ZA') ? 'item.SelectA_Neighborhood' : 'misc.SelectSuburb',
                fn: function isRequired(val) {
                    if ($neighborhood.attr('required') && !$neighborhood.is(':disabled')) {
                        return !!val;
                    }
                    return true;
                }
            }]
        }, true]);
    }
}

function isMandatory(type) {
    return config.getForMarket(this.app.session.get('location').url, ['validator', type, 'enabled'], true);
}

function findCities(state, options, cityId) {
    var $city = this.$(this.selectors.city);
    var promise = this.findLocation('Cities', {
        level: 'states',
        type: 'cities',
        location: state
    }, {
        each: eachLocation.bind(this, 'url')
    }, 'countryoptions.Home_SelectCity');

    promise.val(success.bind(this));

    function success(cities) {
        var selected = false;

        $city.removeAttr('disabled').empty();
        _.each(cities, function each(city) {
            if(city.key == cityId) {
                selected = true;
            }
            $city.append('<option value="' + city.key + '"' + (city.key == cityId ? 'selected="selected"' : '') + '>' + city.value + '</option>');
        }.bind(this));
        options.skipValidation = !selected;
        this.parentView.$el.trigger('fieldSubmit', [$city, options]);
    }
}

function findNeighborhoods(city, options) {
    var $neighborhood = this.$(this.selectors.neighborhood);
    var promise = this.findLocation('Neighborhoods', {
        location: city
    }, {
        readFromCache: false,
        writeToCache: false,
        store: false,
        each: eachLocation.bind(this, 'id')
    }, (this.app.session.get('location').abbreviation !== 'ZA') ? 'item.SelectA_Neighborhood' : 'misc.SelectSuburb');

    promise.then(success.bind(this))
        .val(check.bind(this));

    function success(done, neighborhoods) {
        options.skipValidation = true;

        this.resetNeighborhoods(!!neighborhoods.length);
        if (neighborhoods.length) {
            _.each(neighborhoods, function each(neighborhood) {
                $neighborhood.append('<option value="' + neighborhood.key + '">' + neighborhood.value + '</option>');
            }.bind(this));
            this.parentView.$el.trigger('fieldSubmit', [$neighborhood, options]);
        }
        done(neighborhoods);
    }

    function check(neighborhoods) {
        var neighborhood;

        if (neighborhoods.length) {
            neighborhood = this.getNeighborhood();
            if (neighborhood) {
                neighborhood = $neighborhood.find('option[value=' + neighborhood.id + ']').attr('selected', true);
                if (neighborhood.length) {
                    $neighborhood.trigger('change');
                }
            }
        }
    }
}

function findLocation(collection, params, options, emptyKey) {
    var name = collection.toLowerCase();
    var promise = asynquence().or(fail.bind(this))
        .then(prepare.bind(this))
        .then(fetch.bind(this))
        .then(parse.bind(this));

    function prepare(done) {
        var spec = {};

        spec[name] = {
            collection: collection,
            params: _.defaults({}, params, {
                languageId: this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id
            })
        };
        done(spec, _.omit(options || {}, 'each'));
    }

    function fetch(done, spec, options) {
        this.app.fetch(spec, options, done.errfcb);
    }

    function parse(done, res) {
        var sorted = _.sortBy(res[name].toJSON(), 'name');
        var list = _.map(sorted, options.each);

        if (list.length) {
            this.addEmptyOption(list, emptyKey);
        }
        done(list);
    }

    function fail(error) {
        console.log(error); // TODO: HANDLE ERRORS
    }

    return promise;
}

function getNeighborhood() {
    var location = this.getItem().get('location');
    var neighborhood;

    if (!location) {
        return neighborhood;
    }
    if (location.children && location.children.length) {
        location = location.children[0];
        if (location.children && location.children.length) {
            location = location.children[0];
            if (location.children && location.children.length) {
                neighborhood = location.children[0];
            }
        }
    }
    return neighborhood;
}

function resetNeighborhoods(containsNeighborhoods) {
    var $neighborhood = this.$(this.selectors.neighborhood);
    var $wrapper = $neighborhood.closest('.field-wrapper');
    var item = this.getItem();

    this.parentView.$el.trigger('hideError', [$neighborhood]);
    $neighborhood.empty();
    item.unset('neighborhood');
    item.unset('neighborhood.id');
    item.unset('neighborhood.name');
    if (containsNeighborhoods) {
        $neighborhood.removeAttr('disabled');
        $wrapper.removeClass('hide');
        this.parentView.parentView.errors.neighborhood = (this.app.session.get('location').abbreviation !== 'ZA') ? 'item.SelectA_Neighborhood' : 'misc.SelectSuburb';
        return;
    }
    $neighborhood.attr('disabled', true);
    $wrapper.addClass('hide');
    delete this.parentView.parentView.errors.neighborhood;
}

function addEmptyOption(list, text) {
    list.unshift({
        key: '',
        value: this.dictionary[text]
    });
}

function getItem() {
    return this.parentView.getItem();
}

function eachLocation(key, location) {
    return {
        key: location[key],
        value: location.name
    };
}

function onValidate(event, done, isValid) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    var promise = asynquence(isValid).or(done.fail);

    promise.then(this.validateLocation.bind(this, 'state'));
    promise.then(this.validateLocation.bind(this, 'city'));
    promise.then(this.validateLocation.bind(this, 'neighborhood'));
    promise.val(done);
}

function validateLocation(type, done, isValid) {
    var $field = this.$(this.selectors[type]);

    if (this.isMandatory(type) && $field.attr('required') && !$field.is(':disabled')) {
        return this.parentView.$el.trigger('fieldValidate', [$field, function onComplete(isValidField) {
            done(isValid && isValidField);
        }]);
    }
    done(isValid);
}

function onFormRendered(event, editing) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    var $state = $(this.selectors.state);
    var $city = $(this.selectors.city);
    var $neighborhood = $(this.selectors.neighborhood);
    var category = this.getItem().get('category');
    var options = {
        pendingValidation: (category.id === undefined || category.parentId === undefined)
    };

    if ($state.val()) {
        $state.trigger('change', [options, editing]);
    }
    if ($city.val()) {
        $city.trigger('change', [options, editing]);
    }
    if ($neighborhood.val()) {
        $neighborhood.trigger('change', [_.extend({}, options, {
            pendingValidation: false,
            skipValidation: options.pendingValidation
        })]);
    }
}

function onChangeState(event, options, editing) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    var $field = $(event.currentTarget);
    var $firstOption = $field.find('option').first();
    var $city = $(this.selectors.city);

    options = options || {};

    if ($firstOption.val() === '') {
        $firstOption.remove();
    }
    if (!editing) {
        this.resetNeighborhoods(false);
        this.findCities($field.val(), options, ($city.val() ? [$city.val()] : undefined));
    }
    this.parentView.$el.trigger('fieldSubmit', [$field, options]);
}

function onChangeCity(event, options, editing) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    var $field = $(event.currentTarget);
    var $firstOption = $field.find('option').first();

    options = options || {};

    if ($firstOption.val() === '') {
        $firstOption.remove();
    }
    if (!editing) {
        this.findNeighborhoods($field.val(), options);
    }
    this.parentView.$el.trigger('fieldSubmit', [$field, options]);
}

function onChangeNeighborhood(event, options) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    var $field = $(event.currentTarget);
    var $firstOption = $field.find('option').first();
    var item = this.getItem();

    options = options || {};

    if ($firstOption.val() === '') {
        $firstOption.remove();
    }
    item.unset('neighborhood');
    item.set('neighborhood.id', $field.val());
    item.set('neighborhood.name', $field.find('option:selected').text());
    this.parentView.$el.trigger('fieldSubmit', [$field, options]);
}

module.exports.id = 'post/locations';
