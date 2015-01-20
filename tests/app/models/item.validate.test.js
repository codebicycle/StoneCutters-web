'use strict';

var Data = require('./item');

var Base;
var syncer;
var helpers;
var options;
var Item;
var item;
var statsd;
var Statsd;

describe('app', function() {
    describe('models', function() {
        describe('item', function() {
            describe('.validate', function() {
                beforeEach(reset);
                test();
            });
        });
    });
});

function reset() {
    helpers = {
        dataAdapter: {}
    };
    options = {
        app: {
            session: {},
            req: {
                rendrApp: {}
            }
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
    Item = proxyquire(ROOT + '/app/models/item', {
        '../bases/model': Base,
        '../helpers': helpers,
        '../../shared/statsd': Statsd
    });
    item = undefined;
}

function test() {
    it('should be a method', function() {
        expect(Item.prototype.validate).to.be.instanceOf(Function);
    });

    it('should validate a valid item', function(done) {
        var data = generate();

        mock(data);
        success(done, assert, data);

        function assert(done, response) {
            expect(response.statusCode).to.equal(200);
            expect(helpers.dataAdapter.post).to.have.been.calledOnce;
            done();
        }
    });

    it('should not validate an empty item', function(done) {
        var data = generate([], true);

        mock(data);
        mockFail(data);
        fail(done, assertFail, data);
    });

    it('should not validate an item with no title', function(done) {
        var data = generate('title');

        mock(data);
        mockFail(data);
        fail(done, assertFail, data);
    });

    it('should not validate an item with no description', function(done) {
        var data = generate('description');

        mock(data);
        mockFail(data);
        fail(done, assertFail, data);
    });
}

function generate(properties, include) {
    return _[include ? 'pick' : 'omit'](_.clone(Data), properties || []);
}

function mock(data) {
    item = new Item(data, options);

    sinon.spy(item, 'set');

    helpers.dataAdapter.post = sinon.stub();
    helpers.dataAdapter.post.onFirstCall().callsArgWith(3, null, {
        statusCode: 200
    });

    options.app.session.get = sinon.stub();
    options.app.session.get.withArgs('languageId').returns(10);
    options.app.session.get.withArgs('location').returns({
        abbreviation: 'AR'
    });

    statsd.increment = sinon.stub();
}

function mockFail(data) {
    helpers.dataAdapter.post.onFirstCall().callsArgWith(3, null, {
        statusCode: 200
    }, [{
        selector: 'main',
        message: 'Invalid Item'
    }]);
}

function success(done, assert, data) {
    asynquence().or(done)
        .then(validate)
        .then(assert)
        .val(done);

    function validate(done) {
        item.validate(done);
    }
}

function fail(done, assert, data) {
    asynquence().or(done)
        .then(failure)
        .then(assert)
        .val(done);

    function failure(done) {
        asynquence().or(done)
            .then(validate)
            .val(done);

        function validate(done) {
            item.validate(done, data);
        }
    }
}

function assertFail(done, err) {
    expect(err).to.exist;
    expect(err[0]).to.exist;
    expect(err[0].selector).to.exist;
    expect(err[0].message).to.exist;
    expect(helpers.dataAdapter.post).to.have.been.calledOnce;
    done();
}
