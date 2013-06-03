define(['helpers/ScreenHelper'], function(ScreenHelper) {
	
	describe('The screenHelper',function(){
	
		var callbacks = {};

		// //Create an easily-removed container for our tests to play in
		// beforeEach(function() {
		// });

		// afterEach(function () {
			
		// 	expect(callbacks.doneItems).toHaveBeenCalled();
		// });
		
		//Specs
		it('should return the width',function(){
			var resp = ScreenHelper.getWidth();
			expect(resp).toBe(400);
		});

		it('should return the height',function(){
			var resp = ScreenHelper.getHeight();
			expect(resp).toBe(300);
		});

		it('should return thumbWidth',function(){
			var resp = ScreenHelper.getThumbWidth();
			expect(resp).toBe(180);
		});

		it('should return thumbHeight',function(){
			var resp = ScreenHelper.getThumbHeight();
			expect(resp).toBe(180);
		});

		it('should imgs num',function(){
			var resp = ScreenHelper.getImgsNum();
			expect(resp).toBe(2.2222222222222223);
		});
	});
});