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
            describe('.register', function() {
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
        expect(users.register).to.be.instanceOf(Function);
    });

    it('should register a valid user', function(done) {
        var data = {
            username: 'damianb',
            email: 'damianb@olx.com',
            password: 'dami21',
            agreeTerms: 'on'
        };

        mock(data);
        success(done, assert, data);

        function assert(done) {
            expect(User.prototype.register).to.have.been.calledOnce;
            expect(formidable.error).to.not.have.been.called;
            done();
        }
    });

    it('should not register a user with no username', function(done) {
        var data = {
            email: 'damianb@olx.com',
            password: 'dami21',
            agreeTerms: 'on'
        };

        mock(data);
        mockFail(data);
        fail(done, assertFail, data);
    });

    it('should not register a user with no email', function(done) {
        var data = {
            username: 'damianb',
            password: 'dami21',
            agreeTerms: 'on'
        };

        mock(data);
        mockFail(data);
        fail(done, assertFail, data);
    });

    it('should not register a user with no password', function(done) {
        var data = {
            username: 'damianb',
            email: 'damianb@olx.com',
            agreeTerms: 'on'
        };

        mock(data);
        mockFail(data);
        fail(done, assertFail, data);
    });

    it('should not register an empty user', function(done) {
        var data = {
            agreeTerms: 'on'
        };

        mock(data);
        mockFail(data);
        fail(done, assertFail, data);
    });

    it('should not register a user with no accepted terms', function(done) {
        var data = {
            username: 'damianb',
            email: 'damianb@olx.com',
            password: 'dami21'
        };

        mock(data);
        fail(done, assert, data);

        function assert(done, err) {
            expect(utils.link).to.have.been.calledOnce;
            expect(utils.link).to.have.been.calledWithExactly('/register?agreeTerms=0', req.rendrApp);
            expect(res.redirect).to.have.been.calledOnce;
            done();
        }
    });

    it('should login after success', function(done) {
        var data = {
            username: 'damianb',
            email: 'damianb@olx.com',
            password: 'dami21',
            agreeTerms: 'on'
        };

        mock(data);
        success(done, assert, data);

        function assert(done) {
            expect(User.prototype.register).to.have.been.calledOnce;
            expect(User.prototype.login).to.have.been.calledOnce;
            expect(res.redirect).to.have.been.calledOnce;
            done();
        }
    });

    it('should redirect to / by default after success', function(done) {
        var data = {
            username: 'damianb',
            email: 'damianb@olx.com',
            password: 'dami21',
            agreeTerms: 'on'
        };

        mock(data);
        success(done, assert, data);

        function assert(done) {
            expect(utils.link).to.have.been.calledOnce;
            expect(utils.link).to.have.been.calledWithExactly('/?register_success=true', req.rendrApp);
            expect(res.redirect).to.have.been.calledOnce;
            done();
        }
    });

    it('should not redirect after fail', function(done) {
        var data = {
            username: 'damianb',
            email: 'damianb@olx.com',
            password: 'dami21',
            agreeTerms: 'on'
        };

        mock(data);
        mockFail(data);
        fail(done, assert, data);

        function assert(done) {
            expect(formidable.error).to.have.been.calledWith(req, '/register');
            expect(utils.link).to.have.been.calledOnce;
            expect(res.redirect).to.have.been.calledOnce;
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

    User.prototype.register = sinon.stub();
    User.prototype.register.callsArgWith(0);
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
    User.prototype.register = sinon.spy(function(done) {
        var err = new Error('Invalid Data');

        err.statusCode = 599;
        done.fail(err);
    });
}

function success(done, assert, data) {
    asynquence().or(done)
        .then(register)
        .then(assert)
        .val(done);

    function register(done) {
        users.register(req, res, done);
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
            users.register(req, res, done);
        }
    }
}

function assertFail(done, err) {
    expect(err).to.be.instanceOf(Error);
    expect(err.toString()).to.equal('Error: Invalid Data');
    expect(User.prototype.register).to.have.been.calledOnce;
    expect(formidable.error).to.have.been.calledOnce;
    expect(res.redirect).to.have.been.calledOnce;
    done();
}
