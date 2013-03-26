define(['views/ads/AdsListView','spec/SinonHelper','config/conf'], function(AdsListView,SinonHelper,Conf) {
	describe('The items list',function(){
	
		var wasCall = false;

		//Create an easily-removed container for our tests to play in
		beforeEach(function() {
			setFixtures('<div id="home"><div id="left-panel" data-role="panel"></div><div id="header" data-role="header"><a href="#left-panel" data-rel="panel">Categories</a><h1>ARWEN</h1></div><div id="content" data-role="content"></div></div>');
		});

		afterEach(function () {
			expect(wasCall).toBe(true);
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


	 		urls.push(Conf.get('smaug').url +':'+ Conf.get('smaug').port +'/items/{"countryId":1,"offset":0,"pageSize":10,"categoryId":322}');

			responses.push(items);

			var S = new SinonHelper();

	 		S.fakeResponse(actions,urls,responses, options, function() {
	 			var dfd = $.Deferred().done(_.bind(function(page){
				
					page.render();
					//Items' Expectations
		      		expect($($('#home #ads-list li a')[1]).html()).toBe("<h2>Item 1</h2>"); 
		      		expect($($($('#home #ads-list li')[1]).find('a')[1]).html()).toBe("<h2>Item 2</h2>");
		      		expect($('#home #ads-list li a h2').length).toBe(3);

		      		//Here we check that sinon worked correctly.
		      		wasCall=true;
				}, this));

      			view = new AdsListView({'deferred': dfd, 'cat_id': 322});
			});

		});
	});
});44