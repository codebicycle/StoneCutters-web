define(['views/base/BaseView','config/conf'], function(BaseView, Conf) {
	describe('The categories menu',function(){
	
		var callbacks = {};

		// Create an easily-removed container for our tests to play in
		beforeEach(function() {
			setFixtures('<div id="home"><div id="left-panel" data-role="panel"></div><div id="header" data-role="header"><a href="#left-panel" data-rel="panel">Categories</a><h1>ARWEN</h1></div><div id="content" data-role="content"></div></div>');
		});

		afterEach(function () {
			expect(callbacks.doneCategories).toHaveBeenCalled();
		});
		
		//Specs
		it('should load categories from the json response',function(){
			
			var categories = [{"children": "","name": "For Sale","id": 185,"counter": 1234,"parentId": ""},{"children": "","name": "Vehicles","id": 362,"counter": 1234,"parentId": ""}];

			callbacks.doneCategories = function(page){
				page.render(); 

      			//Categories's Expectations.
	      		expect($($('#home #left-panel-list li a.cat-link')[0]).html()).toBe("For Sale"); 
	      		expect($($('#home #left-panel-list li a.cat-link')[1]).html()).toBe("Vehicles");
				expect($('#home  #left-panel-list li a.cat-link').length).toBe(2);

	      		//Here we check that sinon worked correctly.
	      		wasCall=true;
			}

			spyOn(callbacks,'doneCategories').andCallThrough();
			var dfd = $.Deferred().done(_.bind(callbacks.doneCategories, this));

			spyOn($,'ajax');

 			view = new BaseView({'deferred': dfd});

 			$.ajax.calls[0].args[0].success(categories);
		});
	});
});