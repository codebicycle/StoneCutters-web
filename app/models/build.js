'use strict';

var Base = require('../bases/model');

module.exports = Base.extend({
    url: '/repos/:owner/:name',
    api: 'travis-ci'
});

module.exports.id = 'Build';
