'use strict';

var user = require('../../../server/controllers/user');

describe('server', function() {
    describe('controller', function() {
        describe('server', function() {
            describe('user', function() {
                test();
            })
        })
    })
})

function test() {
    it('should have login method', function() {
        expect(user.register).to.exist;
        expect(user.register).to.be.instanceOf(Function);
    });

    it('should login a user', function() {
        
    });








    it('should have register method', function() {
        expect(user.register).to.exist;
        expect(user.register).to.be.instanceOf(Function);
    });
}
