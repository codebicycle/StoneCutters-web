define(['views/base/BaseView','models/user','config/conf'], 
	function(BaseView,User, Conf) {
	describe('The login link',function(){
	
		var callbacks = {};

		//Create an easily-removed container for our tests to play in
		beforeEach(function() {
			setFixtures('<div id="home"><div id="left-panel" data-role="panel"></div><div id="header" data-role="header"><a href="#left-panel" data-rel="panel">Categories</a><h1>ARWEN</h1></div><div id="content" data-role="content"></div></div>');
		});

		afterEach(function () {
			expect(callbacks.userSuccess).toHaveBeenCalled();
			expect(callbacks.doneCategories).toHaveBeenCalled();
		});
		
		//Specs
		it('should change to a myolx link when the user logs in',function(){
			
			var user = {"id":100,"name":"Pedro Perez","username":"pedro32"};
			var categories = [{"children": "","name": "For Sale","id": 185,"counter": 1234,"parentId": ""},{"children": "","name": "Vehicles","id": 362,"counter": 1234,"parentId": ""}];

	 		callbacks.userSuccess = function(model,response){

				// Backbone.View.prototype.Storage.set("userObj",this.user.toJSON());
				Backbone.View.prototype.Storage.set("userObj",model.toJSON());

				callbacks.doneCategories = function(page){
					page.render();

      				//BaseView Expectations
	      			expect($('#myolx-link').html()).toBe("My OLX - Hi pedro32!");
				}

				spyOn(callbacks,'doneCategories').andCallThrough();

				var dfd = $.Deferred().done(_.bind(callbacks.doneCategories, this));

      			view = new BaseView({'deferred': dfd});

      			// $.ajax.calls[1].args[0].success(categories);
      			$.ajax.calls[0].args[0].success(categories);
			};

			spyOn(callbacks,'userSuccess').andCallThrough();

			spyOn($,'ajax');

			this.user = new User({"username":"pedro32"});
			// Commented because user object doesn't have a URL anymore.
			// No fetch needed. Left as an example for future tests.
			// this.user.on('sync',_.bind(callbacks.userSuccess, this));
			// this.user.fetch();
	
 			// $.ajax.calls[0].args[0].success(user);

 			callbacks.userSuccess(this.user);
 			
		});
	});
});
