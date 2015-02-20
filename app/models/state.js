'use strict';

var Base = require('../bases/model');

module.exports = Base.extend({
    idAttribute: 'url',
    parse: parse,
    fetchCities: fetchCities
});

module.exports.id = 'State';

function parse(state) {
    state.hostname = state.url.split('.').shift();
    return state;
}

function fetchCities(done) {
    this.app.fetch({
        cities: {
            collection: 'Cities',
            params: {
                level: 'states',
                type: 'cities',
                location: this.get('url'),
                languageId: this.get('languageId')
            }
        }
    }, callback.bind(this));

    function callback(err, response) {
        if (!err) {
            this.set('cities', response.cities);
        }
        this.errfcb(done)(err, response.cities);
    }
}
