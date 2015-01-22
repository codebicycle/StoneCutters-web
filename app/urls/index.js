'use strict';

var _ = require('underscore');

var redirections = require('./redirections');
var searches = require('./searches');
var items = require('./items');
var pages = require('./pages');
var users = require('./users');
var post = require('./post');
var categories = require('./categories');
var urls = {};

_.extend(urls, redirections);

// Home
_.extend(urls, {
    'categories#list': {
        url: ''
    }
});

_.extend(urls, pages);
_.extend(urls, users);
_.extend(urls, post);
_.extend(urls, categories);
_.extend(urls, searches);
_.extend(urls, items);

// Handler 404
_.extend(urls, {
    'pages#error': {
        url: /^(?!((\/health$)|(\/force($|\/))|(\/esi($|\/))|(\/stats($|\/))|(\/tracking($|\/))|(\/secure($|\/)))).*/
    }
});

module.exports = urls;
