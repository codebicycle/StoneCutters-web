var should = require("should");
var Categories = require('../../../app/collections/categories');


describe('Categories', function() {

  it('should have a default url if params.user is not specified', function() {
    var repos = new Categories();
    repos.url.should.equal('/countries/:location/categories');
  });

  /*it('should have a unique url if params.user is specified', function() {
    var repos = new Categories();
    repos.params.user = 'someusername';
    repos.url().should.equal('/users/:user/repos');
  });*/

});
