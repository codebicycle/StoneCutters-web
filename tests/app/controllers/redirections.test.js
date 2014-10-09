'use strict';

var controller;
var helpers;

describe('app', function() {
    describe('controllers', function() {
        describe('redirections', function() {
            beforeEach(reset);
            test();
        });
    });
});

function reset() {
    helpers = {
        common: {}
    };
    controller = proxyquire('../app/controllers/redirections', {
        '../helpers': helpers
    });
}

function test() {
    describe('.category', function() {

        it('should be a method', function() {
            expect(controller.category).to.be.instanceOf(Function);
        });

        it('should redirect to /des-cat-:categoryId', function() {
            var data = {
                categoryId: 123
            };

            _test('category', data, '/des-cat-' + data.categoryId);
        });

    });

    describe('.subcategory', function() {

        it('should be a method', function() {
            expect(controller.category).to.be.instanceOf(Function);
        });

        it('should redirect to /des-cat-:categoryId-p-:page', function() {
            var data = {
                categoryId: 123,
                page: 123
            };

            _test('subcategory', data, '/des-cat-' + data.categoryId + '-p-' + data.page);
        });

    });
}

function _test(action, data, url) {
    helpers.common.redirect = sinon.stub();
    controller[action](data);
    assert(url);
}

function assert(url) {
    expect(helpers.common.redirect).to.have.been.calledOnce;
    expect(helpers.common.redirect).to.have.been.calledOn(controller);
    expect(helpers.common.redirect).to.have.been.calledWith(url);
}
