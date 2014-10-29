'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');
var asynquence = require('asynquence');

module.exports = Base.extend({
    tagName: 'section',
    id: 'posting-locations-view',
    className: 'posting-locations-view',
    selected: {},
    initialize: function() {
        this.selected = {};
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var location = this.app.session.get('location');
        var states;
        var cities;

        if (location.current && location.current.type === 'state') {
            this.selected.state = location.current.url;
        }
        else if (location.current && location.current.type === 'city') {
            this.selected.city = location.current.url;
            this.selected.state = location.children[0].url;
        }

        this.states = this.parentView.parentView.options.states;
        
        if (this.states) {
            states = _.map(this.states.toJSON(), function each(state) {
                return {
                    key: state.url,
                    value: state.name
                };
            });
            states.unshift({
                value: this.parentView.parentView.dictionary["countryoptions.Home_SelectState"]
            });
        }

        if (this.cities) {
            cities = _.map(this.cities.toJSON(), function each(city) {
                return {
                    key: city.url,
                    value: city.name
                };
            });
            cities.unshift({
                value: this.parentView.parentView.dictionary["countryoptions.Home_SelectCity"]
            });
        }

        return _.extend({}, data, {
            states: states,
            cities: cities,
            selected: this.selected
        });
    },
    postRender: function() {
        this.states = this.states || this.parentView.options.states;
        
        if (this.rendered) {
            return;
        }
        
        if (this.selected.state && !this.$('#field-location').length) {
            this.$('#field-state').trigger('change');
        }
        else {
            this.rendered = true;
            if (this.selected.city) {
                this.$('#field-location').trigger('change');
            }
        }
    },
    events: {
        'change #field-state': 'onStateChange',
        'change #field-location': 'onCityChange'
    },
    onStateChange: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $field = $(event.target);

        if ($field.val()) {
            $field.closest('.field-wrapper').removeClass('error').addClass('success');
        }
        else {
            $field.closest('.field-wrapper').addClass('error').removeClass('success');
        }

        this.selected.state = $(event.currentTarget).val();
        this.getCities();
    },
    onCityChange: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $field = $(event.target);

        console.log($field.val());

        if ($field.val()) {
            $field.closest('.field-wrapper').removeClass('error').addClass('success');
        }
        else {
            $field.closest('.field-wrapper').addClass('error').removeClass('success');
        }

        this.parentView.$el.trigger('fieldSubmit', [$field]);
    },
    getCities: function() {
        var fetch = function(done) {
            this.app.fetch({
                cities: {
                    collection: 'Cities',
                    params: {
                        level: 'states',
                        type: 'cities',
                        location: this.selected.state,
                        languageId: this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id
                    }
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var error = function(error) {
            console.log(error); // TODO: HANDLE ERRORS
        }.bind(this);

        var success = function(response) {
            this.cities = response.cities;
            this.render();
        }.bind(this);

        asynquence().or(error)
            .then(fetch)
            .val(success);
    }
});

module.exports.id = 'post/locations';
