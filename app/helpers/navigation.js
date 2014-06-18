'use strict';

var _ = require('underscore');

var historyKey = 'history';
var historyCurrentKey = 'hCurrent';

function getSession(app, name, dephault) {
    var value = app.session.get(name) || dephault;
    
    if (value) {
        try {
            value = JSON.parse(value);
        } catch (e) {
            value = dephault;
        }
    }
    return value;
}

function persistSession(app, name, value) {
    var obj = {};
    obj[name] = JSON.stringify(value);

    app.session.persist(obj);
}

function getCurrent() {
    return getSession(this.app, historyCurrentKey, {});
}

function pushCurrent(url, options) {
    var fragment = _.extend({
        url: url
    }, (options || {}));

    return persistSession(this.app, historyCurrentKey, fragment);
}

function getState() {
    var fragments = getSession(this.app, historyKey, []);

    return fragments[fragments.length - 1];
}

function pushState(url, options) {
    var fragments = getSession(this.app, historyKey, []);
    var fragment = {
        url: url
    };

    fragments.push(_.extend(fragment, (options || {})));
    persistSession(this.app, historyKey, fragments);
}

function popState() {
    var fragments = getSession(this.app, historyKey, []);
    var fragment = fragments.pop();
    
    persistSession(this.app, historyKey, fragments);
    return fragment;
}

function clear() {
    persistSession(this.app, historyKey, []);
}

module.exports = {
    getCurrent: getCurrent,
    pushCurrent: pushCurrent,
    getState: getState,
    pushState: pushState,
    popState: popState,
    clear: clear
};