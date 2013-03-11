define(['views/base/BaseView','spec/SinonHelper', 'models/user',], 
	function(BaseView,SinonHelper,User) {
	describe('The login link',function(){
	
		//Create an easily-removed container for our tests to play in
		beforeEach(function() {
			setFixtures('<div id="home"><div id="left-panel" data-role="panel"></div><div id="header" data-role="header"><a href="#left-panel" data-rel="panel">Categories</a><h1>ARWEN</h1></div><div id="content" data-role="content"></div></div>');
		});
		
		//Specs
		it('should change to a myolx link when the user logs in',function(){
			
			var user = '{"id":100,"name":"Pedro Perez","username":"pedro32"}';
			var categories = '[{"children": "","name": "For Sale","id": 185,"counter": 1234,"parentId": ""},{"children": "","name": "Vehicles","id": 362,"counter": 1234,"parentId": ""}]';

			var options = {}; // no additional options for the Ajax request
	 		var view = null;
	 		var actions = [];
	 		var urls = [];
	 		var responses = [];

	 		actions.push("GET");
	 		actions.push("GET");

	 		urls.push('http://smaug.herokuapp.com:80/users/pedro32?token=12345678');
	 		urls.push('http://smaug.herokuapp.com:80/categories/1');

			responses.push(user);
			responses.push(categories);

			var S = new SinonHelper();

	 		S.fakeResponse(actions,urls,responses, options, function() {
	 			var user_success = function(model,response){

					localStorage["userObj"] = JSON.stringify(model);

					var dfd = $.Deferred().done(_.bind(function(page){
						page.render();

		      			//BaseView Expectations
			      		expect($('#myolx-link').html()).toBe("My OLX - Pedro Perez");
					}, this));

	      			view = new BaseView({'deferred': dfd});
				};

	 			var user = new User({"username":"pedro32", "authToken": 12345678});
	 			user.on('sync',_.bind(user_success, this));
	 			user.fetch();
	 			
			});

		});
	});
});