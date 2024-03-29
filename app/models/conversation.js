'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var Base = require('../bases/model');
var dataAdapter = require('../helpers/dataAdapter');
var helpers = require('../helpers');
var Paginator = require('../modules/paginator');
var statsd = require('../../shared/statsd')();

module.exports = Base.extend({
	url: conversationUrl,
	report: report,
	unsubscribe: unsubscribe,
    reply: reply,
    markAsRead: markAsRead,
    toData: toData,
    paginate: paginate,
    parse: parse
});

module.exports.id = 'Conversation';

function conversationUrl(query) {
    var url;

    switch(this.get('conversation_type')) {
        case 'login':
            url = '/conversations/:threadId/messages';
        break;
        case 'hash':
            url = '/conversations/messages';
        break;
        default:
            url = '/conversations/:threadId/messages';
        break;
    }
    return url;
}

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

function reply(done) {
    asynquence().or(fail.bind(this))
        .then(prepare.bind(this))
        .then(submit.bind(this))
        .val(success.bind(this));

    function prepare(done) {
        var query;
        var url;

        if (this.has('hash')) {
            url = '/conversations/reply';
            query = {
                hash: this.get('hash'),
                location: this.get('location'),
                platform: this.app.session.get('platform')
            };
        }
        else {
            url = '/conversations/' + this.get('threadId') + '/reply';
            query = {
                token: this.get('user').token,
                userId: this.get('user').userId,
                location: this.get('location'),
                platform: this.get('platform')
            };
        }

        done(query, url);
    }

    function submit(done, query, url) {
        dataAdapter.post(this.app.req, url, {
            query: query,
            data: this.toData()
        }, done.errfcb);
    }

    function success(reply) {
        statsd.increment([this.get('country'), 'conversations', 'reply', 'success', this.get('platform')]);
        statsd.increment([this.get('country'), 'conversations', 'reply', 'success', this.get('conversation_type'), this.get('platform')]);
        done(reply);
    }

    function fail(err) {
        statsd.increment([this.get('country'), 'conversations', 'reply', 'error', this.get('platform')]);
        statsd.increment([this.get('country'), 'conversations', 'reply', 'error', this.get('conversation_type'), this.get('platform')]);
        done.fail(err);
    }

}

function markAsRead(done) {
    asynquence().or(fail.bind(this))
        .then(prepare.bind(this))
        .then(submit.bind(this))
        .val(success.bind(this));

    function prepare(done) {
        var query;
        var url;

        if (this.get('conversation_type') === 'login') {
            url = '/conversations/' + this.get('threadId') + '/read';
            query = {
                token: this.get('user').token,
                userId: this.get('user').userId,
                location: this.get('location'),
                platform: this.get('platform')
            };
        }
        else {
            url = '/conversations/read';
            query = {
                hash: this.get('hash'),
                location: this.get('location'),
                platform: this.app.session.get('platform')
            };
        }
        done(query, url);
    }

    function submit(done, query, url) {
        dataAdapter.post(this.app.req, url, {
            query: query,
        }, done.errfcb);
    }

    function success(res) {
        done(res);
    }

    function fail(err) {
        done.fail(err);
    }

}

function toData() {
    return {
        message: this.get('message')
    };
}
function paginate(url, query, options) {
    var page = options.page;
    var total;

    this.paginator = new Paginator({
        url: url,
        page: query.page,
        pageSize: query.pageSize,
        total: this.get('count') ? this.get('count') : 0
    }, {
        gallery: options.gallery,
        filters: this.filters
    });
    if (page !== undefined) {
        if (isNaN(page) || page <= 1) {
            return 1;
        }
        total = this.paginator.get('totalPages');
        if (page > total) {
            return total;
        }
    }
}
function parse(message, options) {
    _.each(message.messages, function each(message) {
        if (message.date) {
            message.date = new Date(message.date * 1000);
            message.date = {
                year: message.date.getFullYear(),
                month: message.date.getMonth() + 1,
                day: message.date.getDate(),
                hour: message.date.getHours(),
                minute: message.date.getMinutes(),
                second: message.date.getSeconds()
            };
            message.date.since = helpers.timeAgo(message.date);
        }
    });

    return Base.prototype.parse.apply(this, arguments);
}
