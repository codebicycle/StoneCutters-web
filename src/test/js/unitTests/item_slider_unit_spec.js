define(['views/home/HomeView','config/conf'], function(HomeView,Conf) {
	describe('The item slider',function(){
		
		var callbacks = {};

		// Create an easily-removed container for our tests to play in.
		beforeEach(function() {
			setFixtures('<div id="home"><div id="left-panel" data-role="panel"></div><div id="header" data-role="header"><a href="#left-panel" data-rel="panel">Categories</a><h1>ARWEN</h1></div><div id="content" data-role="content"></div></div>');
		});

		afterEach(function () {
			expect(callbacks.doneItems).toHaveBeenCalled();
		});
		
		//Specs
		it('should load items from the json response',function(){
			
			var whatsnew = [{"displayLocation":"yxPZRgrad","thumbnail":"PzpwSspnO-thumbnail","id":598,"date":"Date-126539","displayPrice":"$15.50","title":"Item 1"},{"displayLocation":"WbvoRgrad","thumbnail":"seUqJzPwj-thumbnail","id":706,"date":"Date-352719","displayPrice":"$18.10","title":"Item 2"},{"displayLocation":"Fzqxjgrad","thumbnail":"dRmYXKDaU-thumbnail","id":993,"date":"Date-25579","displayPrice":"$44.43","title":"Item 3"}];
			var lastVisited = [{"displayLocation":"asdasda","thumbnail":"PSSO-thumbnail","id":123,"date":"Date-189578","displayPrice":"$25.50","title":"Last Visited 1"},{"displayLocation":"WbvoRgrad","thumbnail":"seUqJzPwj-thumbnail","id":1005,"date":"Date-352719","displayPrice":"$40.10","title":"Last Visited 2"}];

			callbacks.doneItems = function(page){
				view.render(); 

	  			//Items's expectations
	      		expect($($('#home #slider1 li a')[0]).attr("href")).toBe("#item/598"); 
	      		expect($($('#home #slider1 li a')[1]).attr("href")).toBe("#item/706");
	      		expect($('#home #slider1 li a img').length).toBe(3);

	      		expect($($('#home #slider2 li figcaption')[0]).html()).toBe("Last Visited 1"); 
	      		expect($($('#home #slider2 li figcaption')[1]).html()).toBe("Last Visited 2");
	      		expect($('#home #slider2 li a img').length).toBe(2);
			}

			spyOn(callbacks,'doneItems').andCallThrough();
			var dfd = $.Deferred().done(_.bind(callbacks.doneItems, this));

			spyOn($,'ajax');

 			view = new HomeView({'deferred': dfd});

 			$.ajax.calls[0].args[0].success(whatsnew);
 			$.ajax.calls[1].args[0].success(lastVisited);
		});
	});
});