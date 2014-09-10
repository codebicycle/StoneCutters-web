'use strict';

var asynquence = require('asynquence');
var proxyquire = require('proxyquire');
var User = function() {};
var formidable = {};
var app = {
    post: function() {}
};
var utils = {};
var users = proxyquire('../../../server/router/users', {
    '../../app/models/user': User,
    '../modules/formidable': formidable,
    '../../shared/utils': utils
})(app);
var req = {
    rendrApp: {
        session: {}
    }
};
var res = {};

describe('server', function() {
    describe('router', function() {
        describe('users', function() {
            describe('.login', function() {
                test();
            });
        });
    });
});

function test() {
    it('should be a method', function() {
        expect(users.login).to.be.instanceOf(Function);
    });

    it('should login a user with valid credentials', function(done) {
        success(done, {
            usernameOrEmail: 'test@arwen.com',
            password: '123456'
        });
    });

    it('should not login a user with no credentials', function(done) {
        fail(done, {});
    });

    it('should not login a user with no languages', function(done) {
        failLanguages(done, {
            usernameOrEmail: 'test@arwen.com',
            password: '123456'
        });
    });

    it('should not login a user with no selectedLanguage', function(done) {
        failLanguage(done, {
            usernameOrEmail: 'test@arwen.com',
            password: '123456'
        });
    });
}

function success(done, credentials) {
    res.redirect = sinon.spy();

    formidable.parse = sinon.stub();
    formidable.parse.callsArgWith(1, null, credentials);
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

    utils.link = sinon.stub();

    asynquence().or(done)
        .then(login)
        .val(assert);

    function login(done) {
        users.login(req, res, done);
    }

    function assert() {
        expect(User.prototype.login).to.have.been.calledOnce;
        expect(formidable.error).to.not.have.been.called;
        expect(res.redirect).to.have.been.calledOnce;
        done();
    }
}

function fail(done, credentials) {
    res.redirect = sinon.spy();

    formidable.parse = sinon.stub();
    formidable.parse.callsArgWith(1, null, credentials);
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

    User.prototype.login = sinon.spy(function(done) {
        done.fail(new Error('Invalid Credentials'));
    });
    User.prototype.get = sinon.stub();

    utils.link = sinon.stub();

    asynquence().or(done)
        .then(failure)
        .val(assert);

    function failure(done) {
        asynquence().or(done)
            .then(login)
            .val(done);

        function login(done) {
            users.login(req, res, done);
        }
    }

    function assert(err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.toString()).to.equal('Error: Invalid Credentials');
        expect(User.prototype.login).to.have.been.calledOnce;
        expect(formidable.error).to.have.been.calledOnce;
        expect(res.redirect).to.have.been.calledOnce;
        done();
    }
}

function failLanguages(done, credentials) {
    res.redirect = sinon.spy();

    formidable.parse = sinon.stub();
    formidable.parse.callsArgWith(1, null, credentials);
    formidable.error = sinon.stub();
    formidable.error.callsArgWith(3);

    req.rendrApp.session.get = sinon.stub();
    req.rendrApp.session.get.withArgs('selectedLanguage').returns('es-AR');

    User.prototype.login = sinon.stub();
    User.prototype.login.callsArgWith(0);
    User.prototype.get = sinon.stub();

    utils.link = sinon.stub();

    asynquence().or(done)
        .then(failure)
        .val(assert);

    function failure(done) {
        asynquence().or(done)
            .then(login)
            .val(done);

        function login(done) {
            users.login(req, res, done);
        }
    }

    function assert(err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.toString()).to.equal('TypeError: Cannot read property \'_byId\' of undefined');
        expect(User.prototype.login).to.have.not.been.called;
        expect(formidable.error).to.have.been.calledOnce;
        expect(res.redirect).to.have.been.calledOnce;
        done();
    }
}

function failLanguage(done, credentials) {
    res.redirect = sinon.spy();

    formidable.parse = sinon.stub();
    formidable.parse.callsArgWith(1, null, credentials);
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

    User.prototype.login = sinon.stub();
    User.prototype.login.callsArgWith(0);
    User.prototype.get = sinon.stub();

    utils.link = sinon.stub();

    asynquence().or(done)
        .then(failure)
        .val(assert);

    function failure(done) {
        asynquence().or(done)
            .then(login)
            .val(done);

        function login(done) {
            users.login(req, res, done);
        }
    }

    function assert(err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.toString()).to.equal('TypeError: Cannot read property \'id\' of undefined');
        expect(User.prototype.login).to.have.not.been.called;
        expect(formidable.error).to.have.been.calledOnce;
        expect(res.redirect).to.have.been.calledOnce;
        done();
    }
}
