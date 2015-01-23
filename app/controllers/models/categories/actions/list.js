'use strict';

var Base = require('../../bases/action');
var config = require('../../../../../shared/config');

var List = Base.extend({
    control: control,
    fetch: fetch,
    action: action
});

function control() {
    asynquence().or(this.error.bind(this))
        .then(this.fetch.bind(this))
        .then(this.action.bind(this))
        .val(this.success.bind(this));
}

function fetch(done) {
    if (!FeatureAd.isEnabled(this.app)) {
        return done();
    }

    var languages = this.app.session.get('languages');

    params.seo = this.app.seo.isEnabled();
    params.languageId = languages._byId[this.app.session.get('selectedLanguage')].id;
    Paginator.prepare(this.app, params);

    this.app.fetch({
        items: {
            collection: 'Items',
            params: _.extend({}, params, FeatureAd.getParams(this.app))
        }
    }, {
        readFromCache: false
    }, done.errfcb);
}

function action(done, res) {
    var location = this.app.session.get('location');
    var platform = this.app.session.get('platform');
    var icons = config.get(['icons', platform], []);
    var country = location.url;

    this.app.seo.setContent(this.dependencies.categories.meta);
    done({
        icons: (~icons.indexOf(country)) ? country.split('.') : 'default'.split('.'),
        location: location,
        items: res ? res.items : undefined 
    });
}

module.exports = List;
