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
        success(done, {
            username: 'arwen',
            email: 'test@arwen.com',
            password: '123456'
        });
    });

    it('should not login a user with no credentials', function(done) {
        fail(done, {}, 'wap');
    });

    it('should not login a user with no username', function(done) {
        fail(done, {
            email: 'test@arwen.com',
            password: '123456'
        });
    });

    it('should not login a user with no email', function(done) {
        fail(done, {
            username: 'arwen',
            password: '123456'
        });
    });

    it('should not login a user with no password', function(done) {
        fail(done, {
            username: 'arwen',
            email: 'test@arwen.com'
        });
    });
}

function success(done, data) {
    var user = new User(data);

    sinon.spy(user, 'set');

    dataAdapter.post = sinon.stub();
    dataAdapter.post.callsArgWith(3, null, null, data);

    asynquence().or(done)
        .then(register)
        .val(assert);

    function register(done) {
        user.register(done, req, data);
    }

    function assert() {
        expect(dataAdapter.post).to.have.been.calledOnce;
        expect(user.set).to.have.been.calledOnce;
        expect(user.toJSON()).to.deep.equal(data);
        done();
    }
}

function fail(done, data) {
    var user = new User(data);

    sinon.spy(user, 'set');

    dataAdapter.post = sinon.stub();
    dataAdapter.post.callsArgWith(3, new Error('Invalid Data'));

    asynquence().or(done)
        .then(failure)
        .val(assert);

    function failure(done) {
        asynquence().or(done)
            .then(register)
            .val(done);

        function register(done) {
            user.register(done, req, data);
        }
    }

    function assert(err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.toString()).to.equal('Error: Invalid Data');
        expect(dataAdapter.post).to.have.been.calledOnce;
        expect(user.set).to.have.not.been.called;
        done();
    }
}
