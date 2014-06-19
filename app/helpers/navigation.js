'use strict';

var _ = require('underscore');

var historyKey = 'history';

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

function getPrevious() {
    var fragments = getSession(this.app, historyKey, []);

    if (fragments.length > 1) {
        return fragments[fragments.length - 2];
    }
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
    getPrevious: getPrevious,
    getState: getState,
    pushState: pushState,
    popState: popState,
    clear: clear
};