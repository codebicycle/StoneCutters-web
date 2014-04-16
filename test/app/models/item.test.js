var should = require("should");
var Item = require('../../../app/models/item');

describe('Item', function describeTest() {
    it('should use login as the model id', function test() {
        var item = new Item();
        item.url().should.equal('/items/:id');
    });
});
