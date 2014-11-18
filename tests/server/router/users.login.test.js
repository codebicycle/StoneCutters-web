'use strict';

var User;
var formidable;
var app;
var utils;
var users;
var req;
var res;
var statsd;
var Statsd;

describe('server', function() {
    describe('router', function() {
        describe('users', function() {
            describe('.login', function() {
                beforeEach(reset);
                test();
            });
        });
    });
});

function reset() {
    User = function() {};
    formidable = {};
    app = {
        post: function() {}
    };
    utils = {};
    req = {
        rendrApp: {
            session: {}
        }
    };
    res = {};
    statsd = {};
    Statsd = function() {
        return statsd;
    };
    users = proxyquire(ROOT + '/server/router/users', {
        '../../app/models/user': User,
        '../modules/formidable': formidable,
        '../modules/statsd': Statsd,
        '../../shared/utils': utils
    })(app);
}

function test() {
    it('should be a method', function() {
        expect(users.login).to.be.instanceOf(Function);
    });

    it('should login a valid user', function(done) {
        var data = {
            usernameOrEmail: 'test@arwen.com',
            password: '123456'
        };

        mock(data);
        success(done, assert, data);

        function assert(done) {
            expect(User.prototype.login).to.have.been.calledOnce;
            expect(formidable.error).to.not.have.been.called;
            done();
        }
    });

    it('should not login an empty user', function(done) {
        var data = {};

        mock(data);
        mockFail(data);
        fail(done, assert, data);

        function assert(done, err) {
            expect(err).to.be.instanceOf(Error);
            expect(err.toString()).to.equal('Error: Invalid Credentials');
            expect(User.prototype.login).to.have.been.calledOnce;
            expect(formidable.error).to.have.been.calledOnce;
            expect(res.redirect).to.have.been.calledOnce;
            done();
        }
    });

    it('should redirect after success', function(done) {
        var data = {
            usernameOrEmail: 'test@arwen.com',
            password: '123456',
            redirect: '/test'
        };

        mock(data);
        success(done, assert, data);

        function assert(done) {
            expect(res.redirect).to.have.been.calledOnce;
            done();
        }
    });

    it('should redirect to / by default after success', function(done) {
        var data = {
            usernameOrEmail: 'test@arwen.com',
            password: '123456'
        };

        mock(data);
        success(done, assert, data);

        function assert(done) {
            expect(utils.link).to.have.been.calledOnce;
            expect(utils.link).to.have.been.calledWithExactly('/', req.rendrApp);
            done();
        }
    });

    it('should redirect to "redirect" by default after success', function(done) {
        var data = {
            usernameOrEmail: 'test@arwen.com',
            password: '123456',
            redirect: '/test'
        };

        mock(data);
        success(done, assert, data);

        function assert(done) {
            expect(utils.link).to.have.been.calledOnce;
            expect(utils.link).to.have.been.calledWithExactly(data.redirect, req.rendrApp);
            done();
        }
    });

    it('should not redirect after fail', function(done) {
        var data = {
            usernameOrEmail: 'test@arwen.com',
            password: '123456'
        };

        mock(data);
        mockFail(data);
        fail(done, assert, data);

        function assert(done) {
            expect(formidable.error).to.have.been.calledWith(req, '/login');
            expect(utils.link).to.have.been.calledOnce;
            expect(res.redirect).to.have.been.calledOnce;
            done();
        }
    });

    it('should not redirect but append "redirect" after fail', function(done) {
        var data = {
            usernameOrEmail: 'test@arwen.com',
            password: '123456',
            redirect: '/test'
        };

        mock(data);
        mockFail(data);
        fail(done, assert, data);

        function assert(done) {
            expect(formidable.error).to.have.been.calledWith(req, '/login?redirect=' + data.redirect);
            done();
        }
    });
}

function mock(data) {
    res.redirect = sinon.spy();

    formidable.parse = sinon.stub();
    formidable.parse.callsArgWith(1, null, data);
    formidable.error = sinon.stub();
    formidable.error.callsArgWith(4);

    req.rendrApp.session.get = sinon.stub();
    req.rendrApp.session.get.withArgs('languages').returns({
        _byId: {
            'es-AR': {
                id: 10
            }
        }
    });
    req.rendrApp.session.get.withArgs('selectedLanguage').returns('es-AR');
    req.rendrApp.session.get.withArgs('location').returns({
        name: 'Test'
    });

    User.prototype.login = sinon.stub();
    User.prototype.login.callsArgWith(0);
    User.prototype.get = sinon.stub();
    User.prototype.toJSON = sinon.stub();
    if (data) {
        Object.keys(data).forEach(function each(key) {
            User.prototype.get.withArgs(key).returns(data[key]);
        });
    }

    utils.link = sinon.stub();

    statsd.increment = sinon.stub();
}

function mockFail(data) {
    User.prototype.login = sinon.spy(function(done) {
        var err = new Error('Invalid Credentials');

        err.statusCode = 599;
        done.fail(err);
    });
}

function success(done, assert, data) {
    asynquence().or(done)
        .then(login)
        .then(assert)
        .val(done);

    function login(done) {
        users.login(req, res, done);
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
            users.login(req, res, done);
        }
    }
}
