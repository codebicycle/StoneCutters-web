define(['views/ads/AdsListView','config/conf'], function(AdsListView,Conf) {
	describe('The items list',function(){
	
		var callbacks = {};

		//Create an easily-removed container for our tests to play in
		beforeEach(function() {
			setFixtures('<div id="home"><div id="left-panel" data-role="panel"></div><div id="header" data-role="header"><a href="#left-panel" data-rel="panel">Categories</a><h1>ARWEN</h1></div><div id="content" data-role="content"></div></div>');
		});

		afterEach(function () {
			expect(callbacks.doneItems).toHaveBeenCalled();
		});
		
		//Specs
		it('should load items from the json response',function(){
			
			var items = [
							{"displayLocation":"yxPZRgrad","thumbnail":"PzpwSspnO-thumbnail","id":518,"date":"Date-126539","displayPrice":"$15.50","title":"Item 1"},
							{"displayLocation":"WbvoRgrad","thumbnail":"seUqJzPwj-thumbnail","id":726,"date":"Date-352719","displayPrice":"$18.10","title":"Item 2"},
							{"displayLocation":"Fzqxjgrad","thumbnail":"dRmYXKDaU-thumbnail","id":933,"date":"Date-25579","displayPrice":"$44.43","title":"Item 4"},
								{"displayLocation":"yxPZRgrad","thumbnail":"PzpwSspnO-thumbnail","id":548,"date":"Date-126539","displayPrice":"$15.50","title":"Item 5"},
							{"displayLocation":"WbvoRgrad","thumbnail":"seUqJzPwj-thumbnail","id":756,"date":"Date-352719","displayPrice":"$18.10","title":"Item 6"},
							{"displayLocation":"Fzqxjgrad","thumbnail":"dRmYXKDaU-thumbnail","id":963,"date":"Date-25579","displayPrice":"$44.43","title":"Item 7"},
								{"displayLocation":"yxPZRgrad","thumbnail":"PzpwSspnO-thumbnail","id":578,"date":"Date-126539","displayPrice":"$15.50","title":"Item 8"},
							{"displayLocation":"WbvoRgrad","thumbnail":"seUqJzPwj-thumbnail","id":786,"date":"Date-352719","displayPrice":"$18.10","title":"Item 9"},
							{"displayLocation":"Fzqxjgrad","thumbnail":"dRmYXKDaU-thumbnail","id":913,"date":"Date-25579","displayPrice":"$44.43","title":"Item 10"},
								{"displayLocation":"yxPZRgrad","thumbnail":"PzpwSspnO-thumbnail","id":528,"date":"Date-126539","displayPrice":"$15.50","title":"Item 11"},
							{"displayLocation":"WbvoRgrad","thumbnail":"seUqJzPwj-thumbnail","id":736,"date":"Date-352719","displayPrice":"$18.10","title":"Item 12"},
							{"displayLocation":"Fzqxjgrad","thumbnail":"dRmYXKDaU-thumbnail","id":943,"date":"Date-25579","displayPrice":"$44.43","title":"Item 13"},
								{"displayLocation":"yxPZRgrad","thumbnail":"PzpwSspnO-thumbnail","id":558,"date":"Date-126539","displayPrice":"$15.50","title":"Item 14"},
							{"displayLocation":"WbvoRgrad","thumbnail":"seUqJzPwj-thumbnail","id":766,"date":"Date-352719","displayPrice":"$18.10","title":"Item 15"},
							{"displayLocation":"Fzqxjgrad","thumbnail":"dRmYXKDaU-thumbnail","id":973,"date":"Date-25579","displayPrice":"$44.43","title":"Item 16"},
						];
			var items2 = [
							{"displayLocation":"yxPZRgrad","thumbnail":"PzpwSspnO-thumbnail","id":518,"date":"Date-126539","displayPrice":"$15.50","title":"Item 17"},
							{"displayLocation":"WbvoRgrad","thumbnail":"seUqJzPwj-thumbnail","id":726,"date":"Date-352719","displayPrice":"$18.10","title":"Item 18"},
							{"displayLocation":"Fzqxjgrad","thumbnail":"dRmYXKDaU-thumbnail","id":933,"date":"Date-25579","displayPrice":"$44.43","title":"Item 19"},
								{"displayLocation":"yxPZRgrad","thumbnail":"PzpwSspnO-thumbnail","id":548,"date":"Date-126539","displayPrice":"$15.50","title":"Item 20"},
							{"displayLocation":"WbvoRgrad","thumbnail":"seUqJzPwj-thumbnail","id":756,"date":"Date-352719","displayPrice":"$18.10","title":"Item 21"},
							{"displayLocation":"Fzqxjgrad","thumbnail":"dRmYXKDaU-thumbnail","id":963,"date":"Date-25579","displayPrice":"$44.43","title":"Item 22"},
								{"displayLocation":"yxPZRgrad","thumbnail":"PzpwSspnO-thumbnail","id":578,"date":"Date-126539","displayPrice":"$15.50","title":"Item 23"},
							{"displayLocation":"WbvoRgrad","thumbnail":"seUqJzPwj-thumbnail","id":786,"date":"Date-352719","displayPrice":"$18.10","title":"Item 24"},
							{"displayLocation":"Fzqxjgrad","thumbnail":"dRmYXKDaU-thumbnail","id":913,"date":"Date-25579","displayPrice":"$44.43","title":"Item 25"},
								{"displayLocation":"yxPZRgrad","thumbnail":"PzpwSspnO-thumbnail","id":528,"date":"Date-126539","displayPrice":"$15.50","title":"Item 26"},
							{"displayLocation":"WbvoRgrad","thumbnail":"seUqJzPwj-thumbnail","id":736,"date":"Date-352719","displayPrice":"$18.10","title":"Item 27"},
							{"displayLocation":"Fzqxjgrad","thumbnail":"dRmYXKDaU-thumbnail","id":943,"date":"Date-25579","displayPrice":"$44.43","title":"Item 28"},
								{"displayLocation":"yxPZRgrad","thumbnail":"PzpwSspnO-thumbnail","id":558,"date":"Date-126539","displayPrice":"$15.50","title":"Item 29"},
							{"displayLocation":"WbvoRgrad","thumbnail":"seUqJzPwj-thumbnail","id":766,"date":"Date-352719","displayPrice":"$18.10","title":"Item 30"},
							{"displayLocation":"Fzqxjgrad","thumbnail":"dRmYXKDaU-thumbnail","id":973,"date":"Date-25579","displayPrice":"$44.43","title":"Item 31"},
						];

	 		callbacks.doneItems =function(page){
				page.render();
				//Items' Expectations
	      		expect($($('#home #ads-list li a h2')[0]).html()).toBe("Item 1");
	      		expect($($('#home #ads-list li a h2')[1]).html()).toBe("Item 2");
	      		expect($('#home #ads-list li a h2').length).toBe(15);

	      		//Here we check that sinon worked correctly.
	      		wasCall=true;
			}
			
			spyOn(callbacks,'doneItems').andCallThrough();

			var dfd = $.Deferred().done(_.bind(callbacks.doneItems, this));

			spyOn($,'ajax');

 			view = new AdsListView({'deferred': dfd, 'cat_id': 322});

			spyOn(view,'checkScroll').andCallThrough();			
			spyOn(view,'loadResults').andCallThrough();
			
			$.ajax.calls[0].args[0].success(items);
			//$.ajax.calls[1].args[0].success(items2);

			$(window).scrollTop(2400);
			$(window).trigger("scroll.322"); 	

			expect(view.loadResults).toHaveBeenCalled();		
		});
	});
});