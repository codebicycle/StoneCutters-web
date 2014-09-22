'use strict';

var User;
var formidable;
var app;
var utils;
var users;
var req;
var res;

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
    users = proxyquire('../server/router/users', {
        '../../app/models/user': User,
        '../modules/formidable': formidable,
        '../../shared/utils': utils
    })(app);
}

function test() {
    it('should be a method', function() {
        expect(users.login).to.be.instanceOf(Function);
    });

    it('should login a user with valid credentials', function(done) {
        var credentials = {
            usernameOrEmail: 'test@arwen.com',
            password: '123456'
        };

        mock(credentials);
        success(done, assert, credentials);

        function assert(done) {
            expect(User.prototype.login).to.have.been.calledOnce;
            expect(formidable.error).to.not.have.been.called;
            done();
        }
    });

    it('should not login a user with no credentials', function(done) {
        var credentials = {};

        mock(credentials);
        mockFail(credentials);
        fail(done, assert, credentials);

        function assert(done, err) {
            expect(err).to.be.instanceOf(Error);
            expect(err.toString()).to.equal('Error: Invalid Credentials');
            expect(User.prototype.login).to.have.been.calledOnce;
            expect(formidable.error).to.have.been.calledOnce;
            expect(res.redirect).to.have.been.calledOnce;
            done();
        }
    });

    it('should not login a user with no languages', function(done) {
        var credentials = {
            usernameOrEmail: 'test@arwen.com',
            password: '123456'
        };

        mock(credentials);
        req.rendrApp.session.get.withArgs('languages').returns();
        fail(done, assert, credentials);

        function assert(done, err) {
            expect(err).to.be.instanceOf(Error);
            expect(err.toString()).to.equal('TypeError: Cannot read property \'_byId\' of undefined');
            expect(User.prototype.login).to.have.not.been.called;
            expect(formidable.error).to.have.been.calledOnce;
            expect(res.redirect).to.have.been.calledOnce;
            done();
        }
    });

    it('should not login a user with no selectedLanguage', function(done) {
        var credentials = {
            usernameOrEmail: 'test@arwen.com',
            password: '123456'
        };

        mock(credentials);
        req.rendrApp.session.get.withArgs('selectedLanguage').returns();
        fail(done, assert, credentials);

        function assert(done, err) {
            expect(err).to.be.instanceOf(Error);
            expect(err.toString()).to.equal('TypeError: Cannot read property \'id\' of undefined');
            expect(User.prototype.login).to.have.not.been.called;
            expect(formidable.error).to.have.been.calledOnce;
            expect(res.redirect).to.have.been.calledOnce;
            done();
        }
    });

    it('should redirect after success', function(done) {
        var credentials = {
            usernameOrEmail: 'test@arwen.com',
            password: '123456',
            redirect: '/test'
        };

        mock(credentials);
        success(done, assert, credentials);

        function assert(done) {
            expect(res.redirect).to.have.been.calledOnce;
            done();
        }
    });

    it('should redirect to / by default after success', function(done) {
        var credentials = {
            usernameOrEmail: 'test@arwen.com',
            password: '123456'
        };

        mock(credentials);
        success(done, assert, credentials);

        function assert(done) {
            expect(utils.link).to.have.been.calledOnce;
            expect(utils.link).to.have.been.calledWithExactly('/', req.rendrApp);
            done();
        }
    });

    it('should redirect to "redirect" by default after success', function(done) {
        var credentials = {
            usernameOrEmail: 'test@arwen.com',
            password: '123456',
            redirect: '/test'
        };

        mock(credentials);
        success(done, assert, credentials);

        function assert(done) {
            expect(utils.link).to.have.been.calledOnce;
            expect(utils.link).to.have.been.calledWithExactly(credentials.redirect, req.rendrApp);
            done();
        }
    });

    it('should not redirect after fail', function(done) {
        var credentials = {
            usernameOrEmail: 'test@arwen.com',
            password: '123456'
        };

        mock(credentials);
        mockFail(credentials);
        fail(done, assert, credentials);

        function assert(done) {
            expect(formidable.error).to.have.been.calledWith(req, '/login');
            expect(utils.link).to.have.been.calledOnce;
            expect(res.redirect).to.have.been.calledOnce;
            done();
        }
    });

    it('should not redirect but append "redirect" after fail', function(done) {
        var credentials = {
            usernameOrEmail: 'test@arwen.com',
            password: '123456',
            redirect: '/test'
        };

        mock(credentials);
        mockFail(credentials);
        fail(done, assert, credentials);

        function assert(done) {
            expect(formidable.error).to.have.been.calledWith(req, '/login?redirect=' + credentials.redirect);
            done();
        }
    });
}

function mock(data) {
    res.redirect = sinon.spy();

    formidable.parse = sinon.stub();
    formidable.parse.callsArgWith(1, null, data);
    formidable.error = sinon.stub();
    formidable.error.callsArgWith(3);

    req.rendrApp.session.get = sinon.stub();
    req.rendrApp.session.get.withArgs('languages').returns({
        _byId: {
            'es-AR': {
                id: 10
            }
        }
    });
    req.rendrApp.session.get.withArgs('selectedLanguage').returns('es-AR');

    User.prototype.login = sinon.stub();
    User.prototype.login.callsArgWith(0);
    User.prototype.get = sinon.stub();
    if (data) {
        Object.keys(data).forEach(function each(key) {
            User.prototype.get.withArgs(key).returns(data[key]);
        });
    }

    utils.link = sinon.stub();
}

function mockFail(data) {
    User.prototype.login = sinon.spy(function(done) {
        done.fail(new Error('Invalid Credentials'));
    });
}

function success(done, assert, credentials) {
    asynquence().or(done)
        .then(login)
        .then(assert)
        .val(done);

    function login(done) {
        users.login(req, res, done);
    }
}

function fail(done, assert, credentials) {
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
