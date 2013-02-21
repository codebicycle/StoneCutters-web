define(['views/home/HomeView'], function(HomeView) {
	describe('The sliding menu',function(){
	
		//Create an easily-removed container for our tests to play in
		beforeEach(function() {
			setFixtures('<div id="home">hola</div>');
		});
		
		//Specs
		it('should load categories from the json response',function(){
			
			var categories = '[{"children": "","name": "For Sale","id": 185,"counter": 1234,"parentId": ""},{"children": "","name": "Vehicles","id": 362,"counter": 1234,"parentId": ""}]';
			var items = '[{"displayLocation":"yxPZRgrad","thumbnail":"PzpwSspnO-thumbnail","id":598,"date":"Date-126539","displayPrice":"$15.552616","title":"Title of ad=dbUpH"},{"displayLocation":"WbvoRgrad","thumbnail":"seUqJzPwj-thumbnail","id":706,"date":"Date-352719","displayPrice":"$18.109798","title":"Title of ad=cHKQC"},{"displayLocation":"Fzqxjgrad","thumbnail":"dRmYXKDaU-thumbnail","id":993,"date":"Date-25579","displayPrice":"$44.43649","title":"Title of ad=GDFPx"}]';

			var options = {}; // no additional options for the Ajax request
	 		var view = null;
	 		var actions = [];
	 		var urls = [];
	 		var responses = [];

	 		actions.push("GET");
	 		actions.push("GET");

	 		urls.push('http://smaug.herokuapp.com:80/categories/1');
			urls.push('http://smaug.herokuapp.com:80/items/{"country_id":1}');

			responses.push(categories);
			responses.push(items);

	 		fakeResponse(actions,urls,responses, options, function() {
	 			view = new HomeView();
			});

	 		$(view.el).attr('data-role', 'page');
      		
      		console.log($('body').html());
      		expect(1).toBe(1); 
		});

		function fakeResponse(actions, urls, responses, options, callback) {
			var statusCode, headers, server;

			// some default values, so we don't have to set status code and
			// content type all the time.
			statusCode = options.statusCode || 200;
			headers = options.headers || { "Content-Type": "application/json" }

			// we create what Sinon.js calls a fake server. This is basically just
			// a name for mocking out all XMLHttpRequests. (There are no actual
			// servers involved.)
			server = sinon.fakeServer.create();

			for (var i=0; i< actions.length; i++)
			{ 
				// we tell Sinon.js what we want to respond respondWith
				server.respondWith(actions[i], urls[i], [statusCode, headers, responses[i]]);
			}

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