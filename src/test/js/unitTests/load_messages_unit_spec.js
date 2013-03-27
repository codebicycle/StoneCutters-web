define(['views/messages/MyMessagesListView','config/conf'], function(MyMessagesListView, Conf) {
	describe('The messages list',function(){
	
 		var callbacks ={};

 		//Create an easily-removed container for our tests to play in
 		beforeEach(function() {
 			setFixtures('<div id="home"><div id="left-panel" data-role="panel"></div><div id="header" data-role="header"><a href="#left-panel" data-rel="panel">Categories</a><h1>ARWEN</h1></div><div id="content" data-role="content"></div></div>');
 			Backbone.View.prototype.Storage.set("userObj",{"username":"mobile_automation","authToken":"ec780678f628386fbc2e72f0c30b12fd2eb13520dfa4490b90de5d7c4dfba95c55844aed2b59775a9637b351697d5dbced9987d7516c1c7e1038e213d5efde65","unreadMessagesCount":0,"favorites":[]});
 		});

 		afterEach(function () {
			expect(callbacks.doneMessages).toHaveBeenCalled();
		});
		
 		//Specs
 		it('should load messages from the json response',function(){
 			var messages = [{"id":"47379107","title":"Message 1","from":{"userId":"0","username":"mobile_automation","email":"damian.buonamico@olx.com"},"body":"este es el mensaje para el sr black"},{"id":"47379108","title":"Message 2","from":{"userId":"0","username":"mobile_automation","email":"damian.buonamico@olx.com"},"body":"este es el mensaje para el sr black"}];
			

  			callbacks.doneMessages = function(page){
				page.render();
				
      			//Messages's Expectations
	      		expect($($($('#home #message-list li')[0]).find('a')[0]).html()).toBe("mobile_automation"); 
	      		expect($($($('#home #message-list li')[0]).find('a')[1]).html()).toBe("Message 1"); 

	      		expect($($($('#home #message-list li')[1]).find('a')[0]).html()).toBe("mobile_automation"); 
	      		expect($($($('#home #message-list li')[1]).find('a')[1]).html()).toBe("Message 2"); 
      		}

      		spyOn(callbacks,'doneMessages').andCallThrough();

			var dfd = $.Deferred().done(_.bind(callbacks.doneMessages, this));

			spyOn($,'ajax');

 			view = new MyMessagesListView({'deferred': dfd});

 			$.ajax.calls[0].args[0].success(messages);
			
		});
	});
});
