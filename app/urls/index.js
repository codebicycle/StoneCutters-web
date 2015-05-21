'use strict';

var _ = require('underscore');

var redirections = require('./redirections');
var searches = require('./searches');
var items = require('./items');
var pages = require('./pages');
var featured = require('./featured');
var users = require('./users');
var post = require('./post');
var categories = require('./categories');
var landings = require('./landings');
var urls = {};

_.extend(urls, redirections);

// Home
_.extend(urls, {
    'categories#list': {
        url: ''
    }
});

_.extend(urls, pages);
_.extend(urls, landings);
_.extend(urls, featured);
_.extend(urls, users);
_.extend(urls, post);
_.extend(urls, categories);
_.extend(urls, searches);
_.extend(urls, items);

// Handler 404
_.extend(urls, {
    'pages#error': {
        url: /^(?!((\/health$)|(\/force($|\/))|(\/esi($|\/))|(\/stats($|\/))|(\/tracking($|\/))|(\/secure($|\/))|(\/nf\/location\/redirect($|\/)))).*/
    }
});

module.exports = urls;
