var should = require("should");
var Item = require('../../../app/models/item');


describe('Item', function() {

  it('should use login as the model id', function() {
    var item = new Item();
    item.url.should.equal('/items/:id');
  });

});
