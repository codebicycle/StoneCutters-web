'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var Base = require('../../../../../common/app/bases/view');
var translations = require('../../../../../../../shared/translations');

module.exports = Base.extend({
    tagName: 'section',
    id: 'posting-locations-view',
    className: 'posting-locations-view',
    initialize: function() {
        Base.prototype.initialize.call(this);
        this.dictionary = translations.get(this.app.session.get('selectedLanguage'));
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var states = data.states;
        var statesSorted;
        var cities = data.cities;
        var citiesSorted;
        var location = data.currentLocation;

        if (states) {
            statesSorted = _.sortBy(states.toJSON(), 'name');

            states = _.map(statesSorted, function each(state) {
                return {
                    key: state.url,
                    value: state.name
                };
            });
        }
        if (!location.state) {
            this.addEmptyOption(states, 'countryoptions.Home_SelectState');
        }
        if (cities) {
            citiesSorted = _.sortBy(cities.toJSON(), 'name');

            cities = _.map(citiesSorted, function each(city) {
                return {
                    key: city.url,
                    value: city.name
                };
            });
        }
        else {
            cities = [];
        }
        if (!location.city) {
            this.addEmptyOption(cities, 'countryoptions.Home_SelectCity');
        }
        return _.extend({}, data, {
            states: states,
            cities: cities,
            location: location
        });
    },
    events: {
        'formRendered': 'onFormRendered',
        'change #field-state': 'onStateChange',
        'change #field-location': 'onCityChange',
        'change #field-neighborhood': 'onNeighborhoodChange'
    },
    addEmptyOption: function(list, text) {
        list.unshift({
            key: '',
            value: this.dictionary[text]
        });
    },
    onFormRendered: function(event) {
        var $states = $('#field-state');
        var $cities = $('#field-location');
        var $neighborhoods = $('#field-neighborhood');
        var category = this.parentView.parentView.getItem().get('category');
        var options = {
            pendingValidation: (category.id === undefined || category.parentId === undefined)
        };

        if ($states.val()) {
            $states.trigger('change', [options]);
        }
        if ($cities.val()) {
            $cities.trigger('change', [options]);
        }
        if ($neighborhoods.val()) {
            $neighborhoods.trigger('change', [options]);
        }
    },
    onStateChange: function(event, options) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $field = $(event.target);
        var $firstOption = $field.find('option').first();
        var $cities = $('#field-location');

        options = options || {};

        if ($firstOption.attr('value') === '') {
            $firstOption.remove();
        }
        this.resetNeighborhoods();
        this.getCities($field.val(), options, ($cities.val() ? [$cities.val()] : undefined));
        this.parentView.$el.trigger('fieldSubmit', [$field, options]);
    },
    onCityChange: function(event, options) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $field = $(event.target);
        var $firstOption = $field.find('option').first();

        options = options || {};

        if ($firstOption.attr('value') === '') {
            $firstOption.remove();
        }

        this.getNeighborhoods($field.val(), options);
        this.parentView.$el.trigger('fieldSubmit', [$field, options]);
    },
    onNeighborhoodChange: function(event, options) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $field = $(event.target);
        var $firstOption = $field.find('option').first();

        options = options || {};

        if ($firstOption.attr('value') === '') {
            $firstOption.remove();
        }

        this.parentView.parentView.getItem().unset('neighborhood');
        this.parentView.parentView.getItem().set('neighborhood.id', $field.val());
        this.parentView.parentView.getItem().set('neighborhood.name', $field.find('option:selected').html());
        this.parentView.$el.trigger('fieldSubmit', [$field, options]);
    },
    getCities: function(state, options, cityId) {
        var $cities = this.$('#field-location');
        var cities;

        options = _.clone(options);

        var fetch = function(done) {
            this.app.fetch({
                cities: {
                    collection: 'Cities',
                    params: {
                        level: 'states',
                        type: 'cities',
                        location: state,
                        languageId: this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id
                    }
                }
            }, done.errfcb);
        }.bind(this);

        var parse = function(done, response) {
            var responseSorted = _.sortBy(response.cities.toJSON(), 'name');

            cities = _.map(responseSorted, function each(city) {
                return {
                    key: city.url,
                    value: city.name
                };
            });
            cities.unshift({
                key: '',
                value: this.dictionary['countryoptions.Home_SelectCity']
            });
            done(cities);
        }.bind(this);

        var error = function(error) {
            console.log(error); // TODO: HANDLE ERRORS
        }.bind(this);

        var success = function(cities) {
            var selected = false;

            $cities.removeAttr('disabled').empty();
            _.each(cities, function each(city) {
                if(city.key == cityId) {
                    selected = true;
                }
                $cities.append('<option value="' + city.key + '"' + (city.key == cityId ? 'selected="selected"' : '') + '>' + city.value + '</option>');
            }.bind(this));
            options.skipValidation = !selected;
            this.parentView.$el.trigger('fieldSubmit', [$cities, options]);
        }.bind(this);

        asynquence().or(error)
            .then(fetch)
            .then(parse)
            .val(success);
    },
    getNeighborhoods: function(city, options) {
        var $neighborhoods = this.$('#field-neighborhood');
        var neighborhoods;

        options = _.clone(options);

        function fetch(done) {
            this.app.fetch({
                neighborhoods: {
                    collection: 'Neighborhoods',
                    params: {
                        location: city,
                        languageId: this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id
                    }
                }
            }, {
                readFromCache: false,
                writeToCache: false,
                store: false
            }, done.errfcb);
        }

        function parse(done, response) {
            var responseSorted = _.sortBy(response.neighborhoods.toJSON(), 'name');
            var location = this.app.session.get('location').abbreviation;
            var translation = (location !== 'ZA') ? 'item.SelectA_Neighborhood' : 'misc.SelectSuburb';

            neighborhoods = _.map(responseSorted, function each(neighborhood) {
                return {
                    key: neighborhood.id,
                    value: neighborhood.name
                };
            });
            if (neighborhoods.length) {
                neighborhoods.unshift({
                    key: '',
                    value: this.dictionary[translation]
                });
            }
            done(neighborhoods);
        }

        function success(done, neighborhoods) {
            options.skipValidation = true;

            if (neighborhoods.length) {
                $neighborhoods.removeAttr('disabled').attr('required', true).empty();
                $neighborhoods.parents('.field-wrapper').removeClass('hide');
                _.each(neighborhoods, function each(neighborhood) {
                    $neighborhoods.append('<option value="' + neighborhood.key + '">' + neighborhood.value + '</option>');
                }.bind(this));
                this.parentView.$el.trigger('fieldSubmit', [$neighborhoods, options]);
            }
            else {
                this.resetNeighborhoods();
            }
            done(neighborhoods);
        }

        function check(neighborhoods) {
            var neighborhood;

            if (neighborhoods.length) {
                neighborhood = this.getNeighborhood();
                if (neighborhood) {
                    neighborhood = $neighborhoods.find('option[value=' + neighborhood.id + ']').attr('selected', true);
                    if (neighborhood.length) {
                        $neighborhoods.trigger('change');
                    }
                }
            }
        }

        function fail(error) {
            console.log(error); // TODO: HANDLE ERRORS
        }

        asynquence().or(fail.bind(this))
            .then(fetch.bind(this))
            .then(parse.bind(this))
            .then(success.bind(this))
            .val(check.bind(this));

    },
    getNeighborhood: function() {
        var item = this.parentView.parentView.getItem();
        var location = item.get('_location');
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
    },
    resetNeighborhoods: function() {
        var $neighborhoods = this.$('#field-neighborhood');

        delete this.parentView.parentView.errors.neighborhoods;
        $neighborhoods.empty().attr('required', false);
        this.parentView.$el.trigger('hideError', [$neighborhoods]);
    }
});

module.exports.id = 'post/locations';
