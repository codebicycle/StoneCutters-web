'use strict';

var Base;
var syncer;
var dataAdapter;
var options;
var User;
var user;
var statsd;
var Statsd;

describe('app', function() {
    describe('models', function() {
        describe('user', function() {
            describe('.login', function() {
                beforeEach(reset);
                test();
            });
        });
    });
});

function reset() {
    dataAdapter = {};
    options = {
        app: {
            session: {}
        }
    };
    syncer = {};
    Base = proxyquire(ROOT + '/app/bases/model', {
        './syncer': syncer
    });
    statsd = {};
    Statsd = function() {
        return statsd;
    };
    User = proxyquire(ROOT + '/app/models/user', {
        '../bases/model': Base,
        '../helpers/dataAdapter': dataAdapter,
        '../../shared/statsd': Statsd
    });
    user = undefined;
}

function test() {
    it('should be a method', function() {
        expect(User.prototype.login).to.be.instanceOf(Function);
    });

    it('should login a user with valid credentials', function(done) {
        var data = {
            usernameOrEmail: 'test@arwen.com',
            password: '123456'
        };

        mock(data);
        success(done, assert, data);

        function assert(done) {
            expect(dataAdapter.get).to.have.been.calledTwice;
            expect(user.set).to.have.been.calledOnce;
            expect(options.app.session.persist).to.have.been.calledOnce;
            expect(user.get('token')).to.exist;
            done();
        }
    });

    it('should not login a user with no credentials', function(done) {
        var data = {};

        mock(data);
        mockFailChallenge(data);
        fail(done, assertFailChallenge, data);
    });

    it('should not login a user with no usernameOrEmail', function(done) {
        var data = {
            password: '123456'
        };

        mock(data);
        mockFailChallenge(data);
        fail(done, assertFailChallenge, data);
    });

    it('should not login a user with invalid usernameOrEmail', function(done) {
        var data = {
            usernameOrEmail: 'invalid',
            password: '123456'
        };

        mock(data);
        mockFailChallenge(data);
        fail(done, assertFailChallenge, data);
    });

    it('should not login a user with no password', function(done) {
        var data = {
            usernameOrEmail: 'test@arwen.com'
        };

        mock(data);
        mockFailLogin(data);
        fail(done, assertFailLogin, data);
    });

    it('should not login a user with invalid password', function(done) {
        var data = {
            usernameOrEmail: 'test@arwen.com',
            password: 'invalid'
        };

        mock(data);
        mockFailLogin(data);
        fail(done, assertFailLogin, data);
    });
}

function mock(data) {
    user = new User(data, options);

    sinon.spy(user, 'set');

    dataAdapter.get = sinon.stub();
    dataAdapter.get.onFirstCall().callsArgWith(3, null, null, {
        challenge: '123456'
    });
    dataAdapter.get.onSecondCall().callsArgWith(3, null, null, {
        token: '123456'
    });

    options.app.session.get = sinon.stub();
    options.app.session.get.withArgs('location').returns({
        name: 'Test'
    });

    options.app.session.persist = sinon.stub();

    statsd.increment = sinon.stub();
}

function mockFailChallenge(data) {
    var err = new Error('Invalid Credentials');

    err.res = {
        statusCode: 599
    };
    dataAdapter.get.onFirstCall().callsArgWith(3, err);
}

function mockFailLogin(data) {
    var err = new Error('Invalid Credentials');

    err.statusCode = 599;
    dataAdapter.get.onSecondCall().callsArgWith(3, err);
}

function success(done, assert, data) {
    asynquence().or(done)
        .then(login)
        .then(assert)
        .val(done);

    function login(done) {
        user.login(done);
    }
}

function fail(done, assert, data) {
    asynquence().or(done)
        .then(failure)
        .then(assert)
        .val(done);

    function failure(done) {
        asynquence().or(done)
            .then(login)
            .val(done);

        function login(done) {
            user.login(done, data);
        }
    }
}

function assertFailChallenge(done, err) {
    expect(err).to.be.instanceOf(Error);
    expect(err.toString()).to.equal('Error: Invalid Credentials');
    expect(dataAdapter.get).to.have.been.calledOnce;
    expect(user.set).to.have.not.been.called;
    expect(options.app.session.persist).to.not.have.been.calledOnce;
    done();
}

function assertFailLogin(done, err) {
    expect(err).to.be.instanceOf(Error);
    expect(err.toString()).to.equal('Error: Invalid Credentials');
    expect(dataAdapter.get).to.have.been.calledTwice;
    expect(user.set).to.have.not.been.called;
    expect(options.app.session.persist).to.not.have.been.calledOnce;
    done();
}
