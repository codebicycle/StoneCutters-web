'use strict';

var _ = require('underscore');
var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'delete': 'DELETE',
    'read': 'GET'
};

function serverSync(method, model, options) {
    var api;
    var urlParts;
    var verb;
    var req;

    options = _.clone(options);
    options.url = this.getUrl(options.url, false);
    verb = methodMap[method];
    urlParts = options.url.split('?');
    req = this.app.req;
    api = {
        method: verb,
        path: urlParts[0],
        query: options.data || {},
        headers: options.headers || {},
        api: _.result(this, 'api'),
        body: {},
        store: options.store,
        host: options.host
    };
    if (verb === 'POST' || verb === 'PUT') {
        api.body = model.toJSON();
    }
    req.dataAdapter.request(req, api, function callback(err, response, body) {
        var resp;

        if (err) {
            resp = {
                body: body || err,
                status: response.statusCode
            };
            if (options.error) {
                options.error(resp);
            }
            else {
                throw err;
            }
        }
        else {
            options.success(body);
        }
    });
}

module.exports = {
    serverSync: serverSync,
    sync: function(method, model, options) {
        var syncMethod = typeof window === 'undefined' ? serverSync : this.clientSync;

        if (options) {
            options.data = _.defaults(options.data || {}, {
                platform: this.app.session.get('platform')
            });
        }
        return syncMethod.apply(this, arguments);
    },
    formatClientUrl: function(url, api) {
        var prefix = this.app.get('apiPath') || '/api';

        if (api) {
            prefix += '/' + api;
        }
        return prefix + url;
    }
};
