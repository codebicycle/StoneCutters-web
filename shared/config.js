'use strict';

module.exports = require('../app/config')(process && process.env && process.env.NODE_ENV ? process.env.NODE_ENV : 'production');
