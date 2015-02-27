'use strict';

var Base = require('../bases/model');
var helpers = require('../helpers');

module.exports = Base.extend({
	url: '/Conversation',
	report: report,
	unsubscribe: unsubscribe
});

module.exports.id = 'Conversation';

function report(done) {
      helpers.dataAdapter.post(this.app.req, '/conversations/report', {
        query: {
            hash: this.get('hash'),
            location: this.app.session.get('location').url,
            platform: this.app.session.get('platform')
        }
    }, callback.bind(this));

    function callback(err) {
        this.errfcb(done)(err);
    }
}

function unsubscribe(done) {
      helpers.dataAdapter.post(this.app.req, '/conversations/unsubscribe', {
        query: {
            hash: this.get('hash'),
            location: this.app.session.get('location').url,
            platform: this.app.session.get('platform')
        }
    }, callback.bind(this));

    function callback(err) {
        this.errfcb(done)(err);
    }
}