define(['views/home/HomeView','spec/SinonHelper','config/conf'], function(HomeView,SinonHelper,Conf) {
	describe('The item slider',function(){
		
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
			
			var whatsnew = '[{"displayLocation":"yxPZRgrad","thumbnail":"PzpwSspnO-thumbnail","id":598,"date":"Date-126539","displayPrice":"$15.50","title":"Item 1"},{"displayLocation":"WbvoRgrad","thumbnail":"seUqJzPwj-thumbnail","id":706,"date":"Date-352719","displayPrice":"$18.10","title":"Item 2"},{"displayLocation":"Fzqxjgrad","thumbnail":"dRmYXKDaU-thumbnail","id":993,"date":"Date-25579","displayPrice":"$44.43","title":"Item 3"}]';
			var lastVisited = '[{"displayLocation":"asdasda","thumbnail":"PSSO-thumbnail","id":123,"date":"Date-189578","displayPrice":"$25.50","title":"Last Visited 1"},{"displayLocation":"WbvoRgrad","thumbnail":"seUqJzPwj-thumbnail","id":1005,"date":"Date-352719","displayPrice":"$40.10","title":"Last Visited 2"}]';

			var options = {}; // no additional options for the Ajax request
	 		var view = null;
	 		var actions = [];
	 		var urls = [];
	 		var responses = [];

	 		actions.push("GET");
	 		actions.push("GET");

			urls.push(Conf.get('smaug').url +':'+ Conf.get('smaug').port +"/items/{\"countryId\":1,\"filters\":\"[{'name':'withPhotos', 'value':'true'}]\"}");
			urls.push(Conf.get('smaug').url +':'+ Conf.get('smaug').port +"/items/{\"countryId\":1}");
			
			responses.push(whatsnew);
			responses.push(lastVisited);

			var S = new SinonHelper();

	 		S.fakeResponse(actions,urls,responses, options, function() {
	 			var dfd = $.Deferred().done(_.bind(function(page){
					
					page.render(); 

	      			//Items's expectations
		      		expect($($('#home #slider1 li a')[0]).attr("href")).toBe("#item/598"); 
		      		expect($($('#home #slider1 li a')[1]).attr("href")).toBe("#item/706");
		      		expect($('#home #slider1 li a img').length).toBe(3);

		      		expect($($('#home #slider2 li h5')[0]).html()).toBe("Last Visited 1"); 
		      		expect($($('#home #slider2 li h5')[1]).html()).toBe("Last Visited 2");
		      		expect($('#home #slider2 li a img').length).toBe(2);
		      		
		      		wasCall=true;
				}, this));
	 			view = new HomeView({'deferred': dfd});
			});
		});
	});
});