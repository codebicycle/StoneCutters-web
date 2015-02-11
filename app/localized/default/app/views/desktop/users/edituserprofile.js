'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var Base = require('../../../../../common/app/bases/view').requireView('users/edituserprofile');
var helpers = require('../../../../../../helpers');
var User = require('../../../../../../models/user');
var States = require('../../../../../../collections/states');

module.exports = Base.extend({
    tagName: 'form',
    className: 'users-edituserprofile-view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            profile: this.getProfile(data.profile),
            states: this.getStates(data.states).map(function each(state) {
                return {
                    key: state.get('id'),
                    value: state.get('name')
                };
            }, this),
            cities: this.cities ? this.cities.map(function each(city) {
                return {
                    key: city.get('id'),
                    value: city.get('name')
                };
            }) : undefined
        });
    },
    postRender: function() {
        if (!this.cities) {
            this.$('[name=stateId]').change();
        }
        else if (!this.rendered) {
            this.$('[name=cityId]').change();
            this.rendered = true;
        }
    },
    events: {
        'change': 'onChange',
        'change [name=stateId]': 'onChangeState',
        'change [name=cityId]': 'onChangeCity',
        'submit': 'onSubmit'
    },
    onChange: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $field = $(event.target);

        this.getProfile().set($field.attr('name'), $field.val());
    },
    onChangeState: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        asynquence().or(fail)
            .then(change.bind(this))
            .then(fetch.bind(this))
            .val(success.bind(this));

            function change(done) {
                var state = this.getStates().findWhere({
                    id: $(event.target).val()
                });

                this.getProfile()
                    .set('stateId', state.get('id'))
                    .set('location', state.get('url'));
                done(state);
            }

            function fetch(done, state) {
                state.set({
                    languageId: this.app.session.get('languageId')
                }).fetchCities(done);
            }

            function success(cities) {
                this.cities = cities;
                this.render();
            }

            function fail(err) {
                console.log(err);
            }
    },
    onChangeCity: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var city = this.cities.findWhere({
            id: $(event.target).val()
        });

        this.getProfile()
            .set('cityId', city.get('id'))
            .set('location', city.get('url'));
    },
    onSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        asynquence().or(fail)
            .then(edit.bind(this))
            .val(success.bind(this));

        function edit(done) {
            this.getProfile().edit(done);
        }

        function success() {
            helpers.common.redirect.call(this.app.router, '/myolx/configuration', null, {
                status: 200
            });
        }

        function fail(err) {
            console.log(err);
        }
    },
    getProfile: function(profile) {
        this.profile = this.profile || (this.parentView.options.profile && this.parentView.options.profile.toJSON ? this.parentView.options.profile : new User(profile || this.parentView.options.profile || {}, {
            app: this.app
        }));
        return this.profile;
    },
    getStates: function(states) {
        this.states = this.states || (this.parentView.options.states && this.parentView.options.states.toJSON ? this.parentView.options.states : new States(states || this.parentView.options.states || {}, {
            app: this.app
        }));
        return this.states;
    }
});
