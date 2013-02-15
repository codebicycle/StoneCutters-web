define(['views/home/HomeView'], function(HomeView) {
	describe('The sliding menu',function(){
	
		//Create an easily-removed container for our tests to play in
		beforeEach(function() {
			setFixtures('<div id="home"></div>');
		});
		
		//Specs
		it('should load categories from the json response',function(){
			
			var response = '[{"children": "","name": "For Sale","id": 185,"counter": 1234,"parentId": ""},{"children": "","name": "Vehicles","id": 362,"counter": 1234,"parentId": ""}]';

			var options = {}; // no additional options for the Ajax request
	 		var view = null;

			//console.log("--*******-------****************************-----");	
	 		//console.log("---"+response+"****");
	 		//console.log("--*******-------****************************-----");
	 		fakeResponse(response, options, function() {
	 			view = new HomeView(); 
	 		});
	 		
	      	(view.$el).attr('data-role', 'page');
	      	view.render();
	      	//console.log($('body').html());
		});

		function fakeResponse(response, options, callback) {
			var statusCode, headers, server, resp;

			// some default values, so we don't have to set status code and
			// content type all the time.
			statusCode = options.statusCode || 200;
			headers = options.headers || { "Content-Type": "application/json" }

			// we create what Sinon.js calls a fake server. This is basically just
			// a name for mocking out all XMLHttpRequests. (There are no actual
			// servers involved.)
			server = sinon.fakeServer.create();

			// we tell Sinon.js what we want to respond with
			server.respondWith([statusCode, headers, response]);

			callback();

			// this actually makes Sinon.js respond to the Ajax request. As we can
			// choose when to respond to a request, it is for example possible to
			// test that spinners start and stop, that we handle timeouts
			// properly, and so on.
			server.respond();

			server.restore();
		}
	});
});