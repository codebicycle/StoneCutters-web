'use strict';

var Base;
var syncer;
var dataAdapter;
var req;
var User;
var user;
var statsd;
var Statsd;

describe('app', function() {
    describe('models', function() {
        describe('user', function() {
            describe('.register', function() {
                beforeEach(reset);
                test();
            });
        });
    });
});

function reset() {
    dataAdapter = {};
    req = {
        rendrApp: {
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
        expect(User.prototype.register).to.be.instanceOf(Function);
    });

    it('should register a valid user', function(done) {
        var data = {
            username: 'arwen',
            email: 'test@arwen.com',
            password: '123456'
        };

        mock(data);
        success(done, assert, data);

        function assert(done) {
            expect(dataAdapter.post).to.have.been.calledOnce;
            expect(user.set).to.have.been.calledOnce;
            expect(user.get('email')).to.equal(data.email);
            expect(user.get('username')).to.equal(data.username);
            done();
        }
    });

    it('should not register an empty user', function(done) {
        var data = {};

        mock(data);
        mockFail(data);
        fail(done, assertFail, data);
    });

    it('should not register a user with no username', function(done) {
        var data = {
            email: 'test@arwen.com',
            password: '123456'
        };

        mock(data);
        mockFail(data);
        fail(done, assertFail, data);
    });

    it('should not register a user with no email', function(done) {
        var data = {
            username: 'arwen',
            password: '123456'
        };

        mock(data);
        mockFail(data);
        fail(done, assertFail, data);
    });

    it('should not register a user with no password', function(done) {
        var data = {
            username: 'arwen',
            email: 'test@arwen.com'
        };

        mock(data);
        mockFail(data);
        fail(done, assertFail, data);
    });
}

function mock(data) {
    user = new User(data);

    sinon.spy(user, 'set');

    dataAdapter.post = sinon.stub();
    dataAdapter.post.callsArgWith(3, null, null, data);

    statsd.increment = sinon.stub();
}

function mockFail(data) {
    var err = new Error('Invalid Data');

    err.statusCode = 599;
    dataAdapter.post.callsArgWith(3, err);
}

function success(done, assert, data) {
    asynquence().or(done)
        .then(register)
        .then(assert)
        .val(done);

    function register(done) {
        user.register(done, req, data);
    }
}

function fail(done, assert, data) {
    asynquence().or(done)
        .then(failure)
        .then(assert)
        .val(done);

    function failure(done) {
        asynquence().or(done)
            .then(register)
            .val(done);

        function register(done) {
            user.register(done, req, data);
        }
    }
}

function assertFail(done, err) {
    expect(err).to.be.instanceOf(Error);
    expect(err.toString()).to.equal('Error: Invalid Data');
    expect(dataAdapter.post).to.have.been.calledOnce;
    expect(user.set).to.have.not.been.called;
    done();
}
