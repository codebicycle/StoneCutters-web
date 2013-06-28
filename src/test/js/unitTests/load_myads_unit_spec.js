define(['views/ads/MyAdsListView', 'config/conf'], function(MyAdsListView, Conf) {
	describe('The myAds list',function(){
	
		var callbacks = {};

 		//Create an easily-removed container for our tests to play in
 		beforeEach(function() {
 			setFixtures('<div id="home"><div id="left-panel" data-role="panel"></div><div id="header" data-role="header"><a href="#left-panel" data-rel="panel">Categories</a><h1>ARWEN</h1></div><div id="content" data-role="content"></div></div>');
 			Backbone.View.prototype.Storage.set("userObj",{"username":"mobile_automation","authToken":"ec780678f628386fbc2e72f0c30b12fd2eb13520dfa4490b90de5d7c4dfba95c55844aed2b59775a9637b351697d5dbced9987d7516c1c7e1038e213d5efde65","unreadMessagesCount":0,"favorites":[]});
 		});

		afterEach(function () {
			expect(callbacks.doneMyAds).toHaveBeenCalled();
		});
		
 		//Specs
 		it('should load myAds from the json response',function(){
 			var myAds = [{"displayLocation":"","thumbnail":"http://images01.olx-st.com/images/mobile/smartphone/no-photos-small.png","id":47379108,"date":"1351713619","displayPrice":"2345.00","status":"ready","title":"My Ads 1"},{"displayLocation":"","thumbnail":"http://images01.olx-st.com/images/mobile/smartphone/no-photos-small.png","id":47311639,"date":"1349297340","displayPrice":"1.00","status":"pending","title":"My Ads 2"}];
			                
			callbacks.doneMyAds = function(page){
				page.render();

	  			//My ads's Expectations
	      		expect($($($('#home #ads-list li')[0]).find('a h2')[0]).html()).toBe("My Ads 1"); 
	      		expect($($($('#home #ads-list li')[1]).find('a h2')[0]).html()).toBe("My Ads 2"); 
	      		expect($($($('#home #ads-list li')[0]).find('a strong')[0]).html()).toBe("2345.00"); 
	      		expect($($($('#home #ads-list li')[1]).find('a strong')[0]).html()).toBe("1.00"); 
	      		expect($($($('#home .status')[0])).html()).toBe("ready"); 
	      		expect($($($('#home .status')[1])).html()).toBe("pending"); 
		  	}

		  	spyOn(callbacks,'doneMyAds').andCallThrough();

			var dfd = $.Deferred().done(_.bind(callbacks.doneMyAds , this));

			spyOn($,'ajax');

   			view = new MyAdsListView({'deferred': dfd});

 			$.ajax.calls[0].args[0].success(myAds);
		});
	});
});