var chai = require('chai');

global.expect = chai.expect;
global.sinon = require('sinon');
global.proxyquire = require('proxyquire').noCallThru();
global.asynquence = require('asynquence');

chai.use(require('sinon-chai'));
