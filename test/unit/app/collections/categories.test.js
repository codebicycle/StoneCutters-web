var should = require("should");
var Categories = require('../../../../app/collections/categories');

describe('app', function test() {
    describe('collections', function test() {
        describe('Categories', function test() {
            it('should have a default url if params.user is not specified', function test() {
                var repos = new Categories();
                repos.url.should.equal('/countries/:location/categories');
            });

            /*it('should have a unique url if params.user is specified', function() {
                var repos = new Categories();
                repos.params.user = 'someusername';
                repos.url().should.equal('/users/:user/repos');
            });*/
        });
    });
});
