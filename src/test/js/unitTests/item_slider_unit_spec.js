define(['views/home/HomeView','spec/SinonHelper'], function(HomeView,SinonHelper) {
	describe('The item slider',function(){
	
		//Create an easily-removed container for our tests to play in
		beforeEach(function() {
			setFixtures('<div id="home"><div id="left-panel" data-role="panel"></div><div id="header" data-role="header"><a href="#left-panel" data-rel="panel">Categories</a><h1>ARWEN</h1></div><div id="content" data-role="content"></div></div>');
		});
		
		//Specs
		it('should load items from the json response',function(){
			
			var items = '[{"displayLocation":"yxPZRgrad","thumbnail":"PzpwSspnO-thumbnail","id":598,"date":"Date-126539","displayPrice":"$15.50","title":"Item 1"},{"displayLocation":"WbvoRgrad","thumbnail":"seUqJzPwj-thumbnail","id":706,"date":"Date-352719","displayPrice":"$18.10","title":"Item 2"},{"displayLocation":"Fzqxjgrad","thumbnail":"dRmYXKDaU-thumbnail","id":993,"date":"Date-25579","displayPrice":"$44.43","title":"Item 3"}]';

			var options = {}; // no additional options for the Ajax request
	 		var view = null;
	 		var actions = [];
	 		var urls = [];
	 		var responses = [];

	 		actions.push("GET");

			urls.push('http://smaug.herokuapp.com:80/items/{"country_id":1}');

			responses.push(items);

			var S = new SinonHelper();

	 		S.fakeResponse(actions,urls,responses, options, function() {
	 			var dfd = $.Deferred().done(_.bind(function(page){
					page.render(); 
	      			
	      			//Items's expectations
		      		expect($($('#home #slider1 li span')[0]).html()).toBe("Item 1 Price: $15.50"); 
		      		expect($($('#home #slider1 li span')[1]).html()).toBe("Item 2 Price: $18.10");
		      		expect($('#home #slider1 li a img').length).toBe(3);
				}, this));

	 			view = new HomeView({'deferred': dfd});
			});

      		
		});
	});
});