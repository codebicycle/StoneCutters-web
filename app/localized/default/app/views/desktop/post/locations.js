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
    firstRender: true,
    initialize: function() {
        Base.prototype.initialize.call(this);
        this.selected = {};
        this.firstRender = true;
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var location = this.app.session.get('location');

        if (location.current) {
            switch (location.current.type) {
                case 'state':
                    this.selected.state = location.current.url;
                    break;
                case 'city':
                    this.selected.city = location.current.url;
                    this.selected.state = location.children[0].url;
                    break;
                default:
                    break;
            }
        }
        this.getStates(!this.selected.state);
        return _.extend({}, data, {
            states: this.states,
            cities: this.cities || undefined,
            selected: this.selected
        });
    },
    postRender: function() {
        if (this.firstRender && this.selected.state) {
            this.firstRender = false;
            this.$('#field-state').trigger('change');
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
        
        this.selected.state = $field.val();
        this.getCities(!this.selected.city);
    },
    onCityChange: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $field = $(event.target);

        this.selected.city = $field.val();
        this.parentView.$el.trigger('fieldSubmit', [$field]);
    },
    getStates: function(addEmptyOption) {
        this.states = _.map(this.parentView.parentView.options.states.toJSON(), function each(state) {
            return {
                key: state.url,
                value: state.name
            };
        });
        if (addEmptyOption) {
            this.addEmptyOption('states', 'countryoptions.Home_SelectState');
        }
    },
    getCities: function(addEmptyOption) {
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
            }, done.errfcb);
        }.bind(this);

        var error = function(error) {
            console.log(error); // TODO: HANDLE ERRORS
        }.bind(this);

        var success = function(response) {
            this.cities = _.map(response.cities.toJSON(), function each(city) {
                return {
                    key: city.url,
                    value: city.name
                };
            });
            if (addEmptyOption) {
                this.addEmptyOption('cities', 'countryoptions.Home_SelectCity');
            }
            this.render();
        }.bind(this);

        asynquence().or(error)
            .then(fetch)
            .val(success);
    },
    addEmptyOption: function(list, key) {
        this[list].unshift({
            key: '',
            value: this.parentView.parentView.dictionary[key]
        });
    }
});

module.exports.id = 'post/locations';
