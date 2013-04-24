// define(['views/ads/AdsListView','config/conf'], function(AdsListView,Conf) {
// 	describe('The items list',function(){
	
// 		var callbacks = {};

// 		//Create an easily-removed container for our tests to play in
// 		beforeEach(function() {
// 			setFixtures('<div id="home"><div id="left-panel" data-role="panel"></div><div id="header" data-role="header"><a href="#left-panel" data-rel="panel">Categories</a><h1>ARWEN</h1></div><div id="content" data-role="content"></div></div>');
// 		});

// 		afterEach(function () {
// 			expect(callbacks.doneItems).toHaveBeenCalled();
// 		});
		
// 		//Specs
// 		it('should load items from the json response',function(){
			
// 			var items = [{"displayLocation":"yxPZRgrad","thumbnail":"PzpwSspnO-thumbnail","id":598,"date":"Date-126539","displayPrice":"$15.50","title":"Item 1"},{"displayLocation":"WbvoRgrad","thumbnail":"seUqJzPwj-thumbnail","id":706,"date":"Date-352719","displayPrice":"$18.10","title":"Item 2"},{"displayLocation":"Fzqxjgrad","thumbnail":"dRmYXKDaU-thumbnail","id":993,"date":"Date-25579","displayPrice":"$44.43","title":"Item 3"}];

// 	 		callbacks.doneItems =function(page){
// 				page.render();
// 				//Items' Expectations
// 	      		expect($($('#home #ads-list li a')[1]).html()).toBe("<h2>Item 1</h2>"); 
// 	      		expect($($($('#home #ads-list li')[1]).find('a')[1]).html()).toBe("<h2>Item 2</h2>");
// 	      		expect($('#home #ads-list li a h2').length).toBe(3);

// 	      		//Here we check that sinon worked correctly.
// 	      		wasCall=true;
// 			}
			
// 			spyOn(callbacks,'doneItems').andCallThrough();

// 			var dfd = $.Deferred().done(_.bind(callbacks.doneItems, this));

// 			spyOn($,'ajax');

//  			view = new AdsListView({'deferred': dfd, 'cat_id': 322});

//  			$.ajax.calls[0].args[0].success(items);
// 		});
// 	});
// });