define(['views/base/BaseView','spec/SinonHelper','config/conf'], function(BaseView,SinonHelper, Conf) {
	describe('The categories menu',function(){
	
		var wasCall = false;

		//Create an easily-removed container for our tests to play in
		beforeEach(function() {
			setFixtures('<div id="home"><div id="left-panel" data-role="panel"></div><div id="header" data-role="header"><a href="#left-panel" data-rel="panel">Categories</a><h1>ARWEN</h1></div><div id="content" data-role="content"></div></div>');
		});

		afterEach(function () {
			expect(wasCall).toBe(true);
		});
		
		//Specs
		it('should load categories from the json response',function(){
			
			var categories = '[{"children": "","name": "For Sale","id": 185,"counter": 1234,"parentId": ""},{"children": "","name": "Vehicles","id": 362,"counter": 1234,"parentId": ""}]';

			var options = {}; // no additional options for the Ajax request
	 		var view = null;
	 		var actions = [];
	 		var urls = [];
	 		var responses = [];

	 		actions.push("GET");

	 		urls.push(Conf.get('smaug').url +':'+ Conf.get('smaug').port + '/categories/1');

			responses.push(categories);

			var S = new SinonHelper();

	 		S.fakeResponse(actions,urls,responses, options, function() {
	 			var dfd = $.Deferred().done(_.bind(function(page){
					page.render(); 

	      			//Categories's Expectations.
		      		expect($($('#home #left-panel-list li a')[1]).html()).toBe("For Sale"); 
		      		expect($($('#home #left-panel-list li a')[2]).html()).toBe("Vehicles");
		      		expect($('#home  #left-panel-list li a').length).toBe(3);

		      		//Here we check that sinon worked correctly.
		      		wasCall=true;
				}, this));

	 			view = new BaseView({'deferred': dfd});
			});
		});
	});
});