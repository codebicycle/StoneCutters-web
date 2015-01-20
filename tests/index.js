var chai = require('chai');

global.ROOT = process.env.COVERAGE ? '../coverage' : '..';
global.expect = chai.expect;
global.sinon = require('sinon');
global.proxyquire = require('proxyquire').noCallThru();
global.asynquence = require('asynquence');
global._ = require('underscore');

chai.use(require('sinon-chai'));
