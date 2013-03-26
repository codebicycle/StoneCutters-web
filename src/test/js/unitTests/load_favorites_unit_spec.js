define(['views/ads/MyFavoriteAdsView','spec/SinonHelper','config/conf'], function(MyFavoritesListView,SinonHelper, Conf) {
	describe('The favorites list',function(){
	
 		var wasCall = false;

 		//Create an easily-removed container for our tests to play in
 		beforeEach(function() {
 			setFixtures('<div id="home"><div id="left-panel" data-role="panel"></div><div id="header" data-role="header"><a href="#left-panel" data-rel="panel">Categories</a><h1>ARWEN</h1></div><div id="content" data-role="content"></div></div>');
 			Backbone.View.prototype.Storage.set("userObj",{"username":"mobile_automation","authToken":"ec780678f628386fbc2e72f0c30b12fd2eb13520dfa4490b90de5d7c4dfba95c55844aed2b59775a9637b351697d5dbced9987d7516c1c7e1038e213d5efde65","unreadMessagesCount":0,"favorites":[]});
 		});

 		afterEach(function () {
			expect(wasCall).toBe(true);
		});
		
 		//Specs
 		it('should load favorites from the json response',function(){
 			var favorites = '[{"displayLocation":"","thumbnail":"http://images01.olx-st.com/images/mobile/smartphone/no-photos-small.png","id":47306212,"date":"1349199169","displayPrice":"642.0","title":"Favorite 1"},{"displayLocation":"","thumbnail":"ui/2/21/45/t_1349376525_47311645_4.jpg","id":47311645,"date":"1349376526","displayPrice":"12.0","title":"Favorite 2"}]';
			
			var options = {}; // no additional options for the Ajax request
	 		var view = null;
	 		var actions = [];
	 		var urls = [];
	 		var responses = [];

	 		actions.push("GET");

	 		
                                                                                               
	 		urls.push( Conf.get('smaug').url +':'+ Conf.get('smaug').port +'/users/favorites?offset=0&pageSize=10&token=ec780678f628386fbc2e72f0c30b12fd2eb13520dfa4490b90de5d7c4dfba95c55844aed2b59775a9637b351697d5dbced9987d7516c1c7e1038e213d5efde65');
			
	 		
			responses.push(favorites);

			var S = new SinonHelper();

	 		S.fakeResponse(actions,urls,responses, options, function() {
  				var dfd = $.Deferred().done(_.bind(function(page){
					page.render();

	      			//Favorites's Expectations
		      		expect($($($('#home #ads-list li')[0]).find('a')[1]).html()).toBe("<h2>Favorite 1</h2>"); 
		      		expect($($($('#home #ads-list li')[1]).find('a')[1]).html()).toBe("<h2>Favorite 2</h2>"); 
		      		expect($($($('#home .displayPrice')[0])).html()).toBe("642.0"); 
		      		expect($($($('#home .displayPrice')[1])).html()).toBe("12.0"); 

		      		//Here we check that sinon worked correctly.
		      		wasCall=true;
	      		}, this));

      			view = new MyFavoritesListView({'deferred': dfd});
			});

		});
	});
});