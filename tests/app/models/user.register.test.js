'use strict';

var asynquence = require('asynquence');
var proxyquire = require('proxyquire');
var dataAdapter = {};
var req = {
    rendrApp: {
        session: {}
    }
};
var User = proxyquire('../../../app/models/user', {
    '../helpers/dataAdapter': dataAdapter
});
var user;

describe('app', function() {
    describe('models', function() {
        describe('user', function() {
            describe('.register', function() {
                test();
            });
        });
    });
});

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
            expect(user.toJSON()).to.deep.equal(data);
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
}

function mockFail(data) {
    dataAdapter.post.callsArgWith(3, new Error('Invalid Data'));
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
