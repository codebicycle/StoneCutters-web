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

        this.states = this.parentView.parentView.options.states;
        return _.extend({}, data, {
            states: this.states.toJSON(),
            cities: this.cities ? this.cities.toJSON() : undefined,
            selectedState: this.selected.state
        });
    },
    postRender: function() {
        this.states = this.states || this.parentView.options.states;
        if (this.rendered) {
            return;
        }
        if (!this.$('#seller-city').length) {
            this.$('#seller-state').trigger('change');
        }
        else {
            this.rendered = true;
            this.$('#seller-city').trigger('change');
        }
    },
    events: {
        'change #seller-state': 'onStateChange',
        'change #seller-city': 'onCityChange'
    },
    onStateChange: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var state = $(event.currentTarget).val();

        var fetch = function(done) {
            $('body > .loading').show();
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
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var error = function(err) {
            $('body > .loading').hide();
            console.log(err); // TODO: HANDLE ERRORS
        }.bind(this);

        var success = function(res) {
            this.cities = res.cities;
            this.render();
            $('body > .loading').hide();
        }.bind(this);

        this.selected.state = state;
        asynquence().or(error)
            .then(fetch)
            .val(success);
    },
    onCityChange: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.parentView.$el.trigger('fieldSubmit', {
            name: 'location',
            value: $(event.currentTarget).val()
        });
    }
});

module.exports.id = 'post/locations';
