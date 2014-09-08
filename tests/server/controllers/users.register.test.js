'use strict';

var asynquence = require('asynquence');
var proxyquire = require('proxyquire');
var DataAdapter = function() {};
var user = proxyquire('../../../server/controllers/user', {
    '../../shared/adapters/data': DataAdapter
});
var req = {
    rendrApp: {
        session: {}
    }
};

describe('server', function() {
    describe('controllers', function() {
        describe('user', function() {
            describe('.register', function() {
                test();
            });
        });
    });
});

function test() {
    it('should be a method', function() {
        expect(user.register).to.be.instanceOf(Function);
    });

    it('should register a valid user', function(done) {
        success(done, {
            username: 'arwen',
            email: 'test@arwen.com',
            password: '123456'
        });
    });

    it('should not login a user with no password', function(done) {
        failure(done, {
            username: 'arwen',
            email: 'test@arwen.com',
            agreeTerms: true
        });
    });

    it('should not login a user with no email', function(done) {
        failure(done, {
            username: 'arwen',
            password: '123456'
        });
    });

    it('should not login a user with no username', function(done) {
        failure(done, {
            email: 'test@arwen.com',
            password: '123456'
        });
    });

    it('should not login a user with no credentials', function(done) {
        failure(done, {}, 'wap');
    });
}

function success(done, data) {
    DataAdapter.prototype.post = sinon.stub();
    DataAdapter.prototype.post.onFirstCall().callsArgWith(3, null, data);
    req.rendrApp.session.get = sinon.stub();
    req.rendrApp.session.get.withArgs('siteLocation').returns('www.olx.com.ar');
    req.rendrApp.session.get.withArgs('languages').returns({
        _byId: {
            'es-AR': {
                id: 10
            }
        }
    });
    req.rendrApp.session.get.withArgs('selectedLanguage').returns('es-AR');
    req.rendrApp.session.get.withArgs('platform').returns('wap');
    asynquence().or(done)
        .then(register)
        .val(assert);

    function register(done) {
        user.register(done, req, data);
    }

    function assert(user) {
        expect(user).to.equal(data);
        done();
    }
}

function failure(done, data) {
    DataAdapter.prototype.post = sinon.stub();
    DataAdapter.prototype.post.callsArgWith(3, new Error('Invalid Data'));
    req.rendrApp.session.get = sinon.stub();
    req.rendrApp.session.get.withArgs('siteLocation').returns('www.olx.com.ar');
    req.rendrApp.session.get.withArgs('languages').returns({
        _byId: {
            'es-AR': {
                id: 10
            }
        }
    });
    req.rendrApp.session.get.withArgs('selectedLanguage').returns('es-AR');
    req.rendrApp.session.get.withArgs('platform').returns('wap');
    asynquence().or(done)
        .then(fail)
        .val(assert);

    function fail(done) {
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
        done();
    }
}
