'use strict';

console.log("<DEBUG CONSOLE LOG>Starting index.js");

var asynquence = require('asynquence');


var app = asynquence()
    .then(require('./cluster'))
    .val(require('./bootstrap'));
