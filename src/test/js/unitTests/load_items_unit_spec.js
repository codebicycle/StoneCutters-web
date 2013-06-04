define(['views/ads/AdsListView','config/conf','helpers/CategoryHelper'], function(AdsListView,Conf,CategoryHelper) {
	describe('The items list',function(){
	
		var callbacks = {};

		//Create an easily-removed container for our tests to play in
		beforeEach(function() {
			setFixtures('<div id="home"><div id="left-panel" data-role="panel"></div><div id="header" data-role="header"><a href="#left-panel" data-rel="panel">Categories</a><h1>ARWEN</h1></div><div id="content" data-role="content"></div></div>');
			CategoryHelper.categories.reset();
		});

		afterEach(function () {
			expect(callbacks.doneItems).toHaveBeenCalled();
		});
		
		//Specs
		it('should load items from the json response',function(){
			
			CategoryHelper.categories.set([
				{"children":[
					{	
						"children":[],
						"name":"Language Classes",
						"id":279,
						"counter":0,
						"parentId":186
					},
					{	
						"children":[],
						"name":"Tutoring - Private Lessons",
						"id":278,
						"counter":0,
						"parentId":186
					},
					{
						"children":[],
						"name":"Other Classes",
						"id":283,
						"counter":0,
						"parentId":186
					},
					{
						"children":[],
						"name":"Computer - Multimedia Classes",
						"id":281,
						"counter":0,
						"parentId":186
					},
					{	
						"children":[],
						"name":"Music - Theatre - Dance Classes",
						"id":280,
						"counter":0,
						"parentId":186
					}
					],
					"name":"Classes",
					"id":186,
					"counter":0,
					"parentId":null
				},
				{"children":[
					{
						"children":[],
						"name":"Carpool",
						"id":248,
						"counter":0,
						"parentId":187
					},
					{	"children":[],
						"name":"Lost And Found",
						"id":413,
						"counter":0,
						"parentId":187
					},
					{
						"children":[],
						"name":"Community Activities",
						"id":381,
						"counter":0,
						"parentId":187
					},
					{
						"children":[],"name":"Musicians - Artists - Bands",
						"id":244,
						"counter":0,
						"parentId":187
					},
					{
						"children":[],
						"name":"Events",
						"id":401,
						"counter":0,
						"parentId":187
					},
					{
						"children":[],
						"name":"Volunteers",
						"id":382,
						"counter":0,
						"parentId":187
					}
					],
					"name":"Community",
					"id":187,
					"counter":0,
					"parentId":null
				}
			]);


			var items = [{"displayLocation":"yxPZRgrad","thumbnail":"PzpwSspnO-thumbnail","id":598,"date":"Date-126539","displayPrice":"$15.50","title":"Item 1"},{"displayLocation":"WbvoRgrad","thumbnail":"seUqJzPwj-thumbnail","id":706,"date":"Date-352719","displayPrice":"$18.10","title":"Item 2"},{"displayLocation":"Fzqxjgrad","thumbnail":"dRmYXKDaU-thumbnail","id":993,"date":"Date-25579","displayPrice":"$44.43","title":"Item 3"}];

	 		callbacks.doneItems =function(page){
				page.render();
				//Items' Expectations
	      		expect($($('#home #ads-list li a h2')[0]).html()).toBe("Item 1");
	      		expect($($('#home #ads-list li a h2')[1]).html()).toBe("Item 2");
	      		expect($('#home #ads-list li a h2').length).toBe(3);

	      		//Here we check that sinon worked correctly.
	      		wasCall=true;
			}
			
			spyOn(callbacks,'doneItems').andCallThrough();

			var dfd = $.Deferred().done(_.bind(callbacks.doneItems, this));

			spyOn($,'ajax');

 			view = new AdsListView({'deferred': dfd, 'cat_id': 186});

 			$.ajax.calls[0].args[0].success(items);
		});
	});
});