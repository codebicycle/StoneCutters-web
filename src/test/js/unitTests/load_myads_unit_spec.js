define(['views/ads/MyAdsListView','spec/SinonHelper','config/conf'], function(MyAdsListView,SinonHelper, Conf) {
	describe('The favorites list',function(){
	
		var wasCall = false;

 		//Create an easily-removed container for our tests to play in
 		beforeEach(function() {
 			setFixtures('<div id="home"><div id="left-panel" data-role="panel"></div><div id="header" data-role="header"><a href="#left-panel" data-rel="panel">Categories</a><h1>ARWEN</h1></div><div id="content" data-role="content"></div></div>');
 			Backbone.View.prototype.Storage.set("userObj",{"username":"mobile_automation","authToken":"ec780678f628386fbc2e72f0c30b12fd2eb13520dfa4490b90de5d7c4dfba95c55844aed2b59775a9637b351697d5dbced9987d7516c1c7e1038e213d5efde65","unreadMessagesCount":0,"favorites":[]});
 			wasCall=false;
 		});

		afterEach(function () {
			expect(wasCall).toBe(true);
		});
		
 		//Specs
 		it('should load favorites from the json response',function(){
 			var favorites = '[{"displayLocation":"","thumbnail":"http://images01.olx-st.com/images/mobile/smartphone/no-photos-small.png","id":47379108,"date":"1351713619","displayPrice":"2345.00","status":"ready","title":"My Ads 1"},{"displayLocation":"","thumbnail":"http://images01.olx-st.com/images/mobile/smartphone/no-photos-small.png","id":47311639,"date":"1349297340","displayPrice":"1.00","status":"pending","title":"My Ads 2"}]';
			                
			var options = {}; // no additional options for the Ajax request
	 		var view = null;
	 		var actions = [];
	 		var urls = [];
	 		var responses = [];

	 		actions.push("GET");

    		urls.push( Conf.get('smaug').url +':'+ Conf.get('smaug').port +'/users/ads?offset=0&pageSize=10&token=ec780678f628386fbc2e72f0c30b12fd2eb13520dfa4490b90de5d7c4dfba95c55844aed2b59775a9637b351697d5dbced9987d7516c1c7e1038e213d5efde65');
		 		
			responses.push(favorites);

			var S = new SinonHelper();

	 		S.fakeResponse(actions,urls,responses, options, function() {
  				var dfd = $.Deferred().done(_.bind(function(page){
					page.render();

	      			//My ads's Expectations
		      		expect($($($('#home #ads-list li')[0]).find('a')[1]).html()).toBe("<h2>My Ads 1</h2>"); 
		      		expect($($($('#home #ads-list li')[1]).find('a')[1]).html()).toBe("<h2>My Ads 2</h2>"); 
		      		expect($($($('#home .displayPrice')[0])).html()).toBe("2345.00"); 
		      		expect($($($('#home .displayPrice')[1])).html()).toBe("1.00"); 
		      		expect($($($('#home .listingStatus')[0])).html()).toBe("ready"); 
		      		expect($($($('#home .listingStatus')[1])).html()).toBe("pending"); 

  					//Here we check that sinon worked correctly.
		      		wasCall=true;					
	      		}, this));

      			view = new MyAdsListView({'deferred': dfd});
			});

		});
	});
});