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
            describe('.reply', function() {
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
    users = proxyquire(ROOT + '/server/router/users', {
        '../../app/models/user': User,
        '../modules/formidable': formidable,
        '../../shared/utils': utils
    })(app);
}

function test() {
    it('should be a method', function() {
        expect(users.reply).to.be.instanceOf(Function);
    });

    it('should reply a valid data', function(done) {
        var data = {
            itemId: '123456789',
            message: 'This is the message',
            email: 'robot_test@olx.com',
            name: 'robot_test',
            phone: ''
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

    it('should not register a user with no languages', function(done) {
        var data = {
            username: 'damianb',
            email: 'damianb@olx.com',
            password: 'dami21',
            agreeTerms: 'on'
        };

        mock(data);
        req.rendrApp.session.get.withArgs('languages').returns();
        fail(done, assert, data);

        function assert(done, err) {
            expect(err).to.be.instanceOf(Error);
            expect(err.toString()).to.equal('TypeError: Cannot read property \'_byId\' of undefined');
            expect(User.prototype.register).to.have.not.been.called;
            expect(formidable.error).to.have.been.calledOnce;
            expect(res.redirect).to.have.been.calledOnce;
            done();
        }
    });

    it('should not register a user with no selectedLanguage', function(done) {
        var data = {
            username: 'damianb',
            email: 'damianb@olx.com',
            password: 'dami21',
            agreeTerms: 'on'
        };

        mock(data);
        req.rendrApp.session.get.withArgs('selectedLanguage').returns();
        fail(done, assert, data);

        function assert(done, err) {
            expect(err).to.be.instanceOf(Error);
            expect(err.toString()).to.equal('TypeError: Cannot read property \'id\' of undefined');
            expect(User.prototype.register).to.have.not.been.called;
            expect(formidable.error).to.have.been.calledOnce;
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
            expect(utils.link).to.have.been.calledWithExactly('/iid-123456789/reply/success', req.rendrApp);
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

    User.prototype.reply = sinon.stub();
    User.prototype.reply.callsArgWith(0);
    User.prototype.get = sinon.stub();
    if (data) {
        Object.keys(data).forEach(function each(key) {
            User.prototype.get.withArgs(key).returns(data[key]);
        });
    }

    utils.link = sinon.stub();
}

function mockFail(data) {
    User.prototype.reply = sinon.spy(function(done) {
        done.fail(new Error('Invalid Data'));
    });
}

function success(done, assert, data) {
    asynquence().or(done)
        .then(reply)
        .then(assert)
        .val(done);

    function reply(done) {
        users.reply(req, res, done);
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
            users.reply(req, res, done);
        }
    }
}

function assertFail(done, err) {
    expect(err).to.be.instanceOf(Error);
    expect(err.toString()).to.equal('Error: Invalid Data');
    expect(User.prototype.reply).to.have.been.calledOnce;
    expect(formidable.error).to.have.been.calledOnce;
    expect(res.redirect).to.have.been.calledOnce;
    done();
}
