define(['views/messages/MyMessagesListView','spec/SinonHelper','config/conf'], function(MyMessagesListView,SinonHelper, Conf) {
	describe('The messages list',function(){
	
 		//Create an easily-removed container for our tests to play in
 		beforeEach(function() {
 			setFixtures('<div id="home"><div id="left-panel" data-role="panel"></div><div id="header" data-role="header"><a href="#left-panel" data-rel="panel">Categories</a><h1>ARWEN</h1></div><div id="content" data-role="content"></div></div>');
 			Backbone.View.prototype.Storage.set("userObj",{"username":"mobile_automation","authToken":"ec780678f628386fbc2e72f0c30b12fd2eb13520dfa4490b90de5d7c4dfba95c55844aed2b59775a9637b351697d5dbced9987d7516c1c7e1038e213d5efde65","unreadMessagesCount":0,"favorites":[]});
 		});
		
 		//Specs
 		it('should load messages from the json response',function(){
 			var messages = '[{"id":"47379107","title":"Message 1","from":{"userId":"0","username":"mobile_automation","email":"damian.buonamico@olx.com"},"body":"este es el mensaje para el sr black"},{"id":"47379108","title":"Message 2","from":{"userId":"0","username":"mobile_automation","email":"damian.buonamico@olx.com"},"body":"este es el mensaje para el sr black"}]';
			
			var options = {}; // no additional options for the Ajax request
	 		var view = null;
	 		var actions = [];
	 		var urls = [];
	 		var responses = [];

	 		actions.push("GET");
                                                                                               
	 		urls.push( Conf.get('smaug').url +':'+ Conf.get('smaug').port +'/users/messages?offset=0&pageSize=10&token=ec780678f628386fbc2e72f0c30b12fd2eb13520dfa4490b90de5d7c4dfba95c55844aed2b59775a9637b351697d5dbced9987d7516c1c7e1038e213d5efde65');
			
	 		
			responses.push(messages);

			var S = new SinonHelper();

	 		S.fakeResponse(actions,urls,responses, options, function() {
  				var dfd = $.Deferred().done(_.bind(function(page){
					page.render();
					
	      			//Messages's Expectations
		      		expect($($($('#home #message-list li')[0]).find('a')[0]).html()).toBe("mobile_automation"); 
		      		expect($($($('#home #message-list li')[0]).find('a')[1]).html()).toBe("Message 1"); 

		      		expect($($($('#home #message-list li')[1]).find('a')[0]).html()).toBe("mobile_automation"); 
		      		expect($($($('#home #message-list li')[1]).find('a')[1]).html()).toBe("Message 2"); 
	      		}, this));

      			view = new MyMessagesListView({'deferred': dfd});
			});

		});
	});
});