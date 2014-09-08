'use strict';

var asynquence = require('asynquence');
var proxyquire = require('proxyquire');
var DataAdapter = function() {};
var user = proxyquire('../../../server/controllers/user', {
    '../../shared/adapters/data': DataAdapter
});
var req = {
    rendrApp: {
        session: {}
    }
};

describe('server', function() {
    describe('controllers', function() {
        describe('user', function() {
            describe('.login', function() {
                test();
            });
        });
    });
});

function test() {
    it('should be a method', function() {
        expect(user.login).to.be.instanceOf(Function);
    });

    it('should login a user with valid credentials', function(done) {
        success(done, {
            usernameOrEmail: 'test@arwen.com',
            password: '123456'
        });
    });

    it('should not login a user with no password', function(done) {
        failure(done, {
            usernameOrEmail: 'test@arwen.com'
        });
    });

    it('should not login a user with no usernameOrEmail', function(done) {
        failure(done, {
            password: '123456'
        });
    });

    it('should not login a user with no credentials', function(done) {
        failure(done, {});
    });
}

function success(done, credentials) {
    DataAdapter.prototype.get = sinon.stub();
    DataAdapter.prototype.get.onFirstCall().callsArgWith(3, null, {
        challenge: '123456'
    });
    DataAdapter.prototype.get.onSecondCall().callsArgWith(3, null, {
        token: '123456'
    });
    req.rendrApp.session.get = sinon.stub();
    req.rendrApp.session.get.withArgs('platform').returns('wap');
    asynquence().or(done)
        .then(login)
        .val(assert);

    function login(done) {
        user.login(done, req, credentials);
    }

    function assert(user) {
        expect(user).to.exist;
        expect(user.token).to.exist;
        done();
    }
}

function failure(done, credentials) {
    DataAdapter.prototype.get = sinon.stub();
    DataAdapter.prototype.get.callsArgWith(3, new Error('Invalid Credentials'));
    req.rendrApp.session.get = sinon.stub();
    req.rendrApp.session.get.withArgs('platform').returns('wap');
    asynquence().or(done)
        .then(fail)
        .val(assert);

    function fail(done) {
        asynquence().or(done)
            .then(login)
            .val(done);

        function login(done) {
            user.login(done, req, credentials);
        }
    }

    function assert(err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.toString()).to.equal('Error: Invalid Credentials');
        done();
    }
}
