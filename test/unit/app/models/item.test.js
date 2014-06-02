var should = require("should");
var Item = require('../../../../app/models/item');

describe('app', function test() {
    describe('models', function test() {
        describe('Item', function test() {
            it('should use login as the model id', function test() {
                var item = new Item();
                item.url().should.equal('/items/:id');
            });
        });
    });
});
