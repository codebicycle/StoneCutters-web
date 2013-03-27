define(['models/category'], function (CategoryModel){

	describe('The Category model object',function(){
		
		var rootId = 'testContainer';
		
		//Create an easily-removed container for our tests to play in
		beforeEach(function() {
			var container = document.createElement('div');
			container.setAttribute('id',rootId);		
			document.body.appendChild(container);

			// The following commented code serves as an alternative way to 'import' the categoryModel.

			// var flag = false;
			// var that = this;

			// require(['models/category'], function (CategoryModel) { 
            
            // that.categoryModel = new CategoryModel();
			// that.categoryModel.set({name: "Buy and sell", index: 1});

			// console.log(that.categoryModel.get("name"));

			// flag = true;
            
   //      	});

   //      	waitsFor(function() {
   //    			return flag;
   //  		});

		});
		
		//Clean it up after each spec
		afterEach(function() {
			var container = document.getElementById(rootId);
			container.parentNode.removeChild(container);
		});
			
		//Specs
		it('populates correctly',function(){

			var categoryModel = new CategoryModel();
			categoryModel.set({name: "Buy and sell", index: 1});

			expect(categoryModel.get("name")).toBe("Buy and sell");
			expect(categoryModel.get("index")).toBe(1);

            
		});

	});
});