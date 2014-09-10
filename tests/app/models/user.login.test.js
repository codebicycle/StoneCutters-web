'use strict';

var asynquence = require('asynquence');
var proxyquire = require('proxyquire');
var dataAdapter = {};
var User = proxyquire('../../../app/models/user', {
    '../helpers/dataAdapter': dataAdapter
});
var req = {
    rendrApp: {
        session: {}
    }
};

describe('app', function() {
    describe('models', function() {
        describe('user', function() {
            describe('.login', function() {
                test();
            });
        });
    });
});

function test() {
    it('should be a method', function() {
        expect(User.prototype.login).to.be.instanceOf(Function);
    });

    it('should login a user with valid credentials', function(done) {
        success(done, {
            usernameOrEmail: 'test@arwen.com',
            password: '123456'
        });
    });

    it('should not login a user with no credentials', function(done) {
        failChallenge(done, {});
    });

    it('should not login a user with no usernameOrEmail', function(done) {
        failChallenge(done, {
            password: '123456'
        });
    });

    it('should not login a user with invalid usernameOrEmail', function(done) {
        failChallenge(done, {
            usernameOrEmail: 'invalid',
            password: '123456'
        });
    });

    it('should not login a user with no password', function(done) {
        failLogin(done, {
            usernameOrEmail: 'test@arwen.com'
        });
    });

    it('should not login a user with invalid password', function(done) {
        failLogin(done, {
            usernameOrEmail: 'test@arwen.com',
            password: 'invalid'
        });
    });
}

function success(done, credentials) {
    var user = new User(credentials);

    sinon.spy(user, 'set');

    dataAdapter.get = sinon.stub();
    dataAdapter.get.onFirstCall().callsArgWith(3, null, null, {
        challenge: '123456'
    });
    dataAdapter.get.onSecondCall().callsArgWith(3, null, null, {
        token: '123456'
    });

    req.rendrApp.session.persist = sinon.stub();

    asynquence().or(done)
        .then(login)
        .val(assert);

    function login(done) {
        user.login(done, req);
    }

    function assert() {
        expect(dataAdapter.get).to.have.been.calledTwice;
        expect(user.set).to.have.been.calledOnce;
        expect(req.rendrApp.session.persist).to.have.been.calledOnce;
        expect(user.get('token')).to.exist;
        done();
    }
}

function failChallenge(done, credentials) {
    var user = new User(credentials);

    sinon.spy(user, 'set');

    dataAdapter.get = sinon.stub();
    dataAdapter.get.callsArgWith(3, new Error('Invalid Credentials'));
    req.rendrApp.session.persist = sinon.stub();

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
        expect(dataAdapter.get).to.have.been.calledOnce;
        expect(user.set).to.have.not.been.called;
        expect(req.rendrApp.session.persist).to.not.have.been.calledOnce;
        done();
    }
}

function failLogin(done, credentials) {
    var user = new User(credentials);

    sinon.spy(user, 'set');

    dataAdapter.get = sinon.stub();
    dataAdapter.get.onFirstCall().callsArgWith(3, null, null, {
        challenge: '123456'
    });
    dataAdapter.get.onSecondCall().callsArgWith(3, new Error('Invalid Credentials'));

    req.rendrApp.session.persist = sinon.stub();

    asynquence().or(done)
        .then(failure)
        .val(assert);

    function failure(done) {
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
        expect(dataAdapter.get).to.have.been.calledTwice;
        expect(user.set).to.have.not.been.called;
        expect(req.rendrApp.session.persist).to.not.have.been.calledOnce;
        done();
    }
}
