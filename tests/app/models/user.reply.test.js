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
            describe('.reply', function() {
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
        expect(User.prototype.reply).to.be.instanceOf(Function);
    });

    it('should reply a valid user', function(done) {
        var data = {
            itemId: '123456789',
            message: 'This is the message',
            email: 'robot_test@olx.com',
            name: 'robot_test',
            phone: '123456789',
            token: '123456789'
        };

        mock(data);
        success(done, assert, data);

        function assert(done) {
            expect(dataAdapter.post).to.have.been.calledOnce;
            done();
        }
    });

    it('should not reply an empty form', function(done) {
        var data = {};

        mock(data);
        mockFail(data);
        fail(done, assertFail, data);
    });

    it('should not reply with no message', function(done) {
        var data = {
            itemId: '123456789',
            email: 'robot_test@olx.com',
            name: 'robot_test',
            phone: '123456789',
            token: '123456789'
        };

        mock(data);
        mockFail(data);
        fail(done, assertFail, data);
    });

    it('should not reply with no email', function(done) {
        var data = {
            itemId: '123456789',
            message: 'This is the message',
            name: 'robot_test',
            phone: '123456789',
            token: '123456789'
        };

        mock(data);
        mockFail(data);
        fail(done, assertFail, data);
    });

    it('should not reply with no name', function(done) {
        var data = {
            itemId: '123456789',
            message: 'This is the message',
            email: 'robot_test@olx.com',
            phone: '123456789',
            token: '123456789'
        };

        mock(data);
        mockFail(data);
        fail(done, assertFail, data);
    });

    it('should reply with no phone', function(done) {
        var data = {
            itemId: '123456789',
            message: 'This is the message',
            email: 'robot_test@olx.com',
            name: 'robot_test',
            token: '123456789'
        };

        mock(data);
        mockFail(data);
        fail(done, assertFail, data);
    });

    it('should reply with no token', function(done) {
        var data = {
            itemId: '123456789',
            message: 'This is the message',
            email: 'robot_test@olx.com',
            name: 'robot_test',
            phone: '123456789'
        };

        mock(data);
        mockFail(data);
        fail(done, assertFail, data);
    });
}

function mock(data) {
    user = new User(data);

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
        .then(reply)
        .then(assert)
        .val(done);

    function reply(done) {
        user.reply(done, req, data);
    }
}

function fail(done, assert, data) {
    asynquence().or(done)
        .then(failure)
        .then(assert)
        .val(done);

    function failure(done) {
        asynquence().or(done)
            .then(reply)
            .val(done);

        function reply(done) {
            user.reply(done, req, data);
        }
    }
}

function assertFail(done, err) {
    expect(err).to.be.instanceOf(Error);
    expect(err.toString()).to.equal('Error: Invalid Data');
    expect(dataAdapter.post).to.have.been.calledOnce;
    done();
}
