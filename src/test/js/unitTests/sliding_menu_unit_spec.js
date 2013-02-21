define(['views/home/HomeView'], function(HomeView) {
	describe('The sliding menu',function(){
	
		//Create an easily-removed container for our tests to play in
		beforeEach(function() {
			setFixtures('<div id="home"><div id="left-panel" data-role="panel"></div><div id="header" data-role="header"><a href="#left-panel" data-rel="panel">Categories</a><h1>ARWEN</h1></div><div id="content" data-role="content"></div></div>');
		});
		
		//Specs
		it('should load categories from the json response',function(){
			
			var categories = '[{"children": "","name": "For Sale","id": 185,"counter": 1234,"parentId": ""},{"children": "","name": "Vehicles","id": 362,"counter": 1234,"parentId": ""}]';
			var items = '[{"displayLocation":"yxPZRgrad","thumbnail":"PzpwSspnO-thumbnail","id":598,"date":"Date-126539","displayPrice":"$15.50","title":"Item 1"},{"displayLocation":"WbvoRgrad","thumbnail":"seUqJzPwj-thumbnail","id":706,"date":"Date-352719","displayPrice":"$18.10","title":"Item 2"},{"displayLocation":"Fzqxjgrad","thumbnail":"dRmYXKDaU-thumbnail","id":993,"date":"Date-25579","displayPrice":"$44.43","title":"Item 3"}]';

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
	 			view.render();
			});
	 		
      		//Categories's Expectations
      		expect($($('#home #categories-list li a')[0]).html()).toBe("For Sale"); 
      		expect($($('#home #categories-list li a')[1]).html()).toBe("Vehicles");
      		expect($('#home  #categories-list li a').length).toBe(2);

      		//Items's expectations
      		expect($($('#home #slider1 li span')[0]).html()).toBe("Item 1 Price: $15.50"); 
      		expect($($('#home #slider1 li span')[1]).html()).toBe("Item 2 Price: $18.10");
      		expect($('#home #slider1 li a img').length).toBe(3);
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