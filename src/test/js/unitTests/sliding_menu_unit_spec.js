define(['views/home/HomeView'], function(HomeView) {
describe('The sliding menu',function(){
	
	//Create an easily-removed container for our tests to play in
	beforeEach(function() {

		setFixtures('<div id="home"></div>');
		this.homeView = new HomeView();

	});
	
	//Specs
	it('is attached',function(){
 
      	$(this.homeView.el).attr('data-role', 'page');
      	this.homeView.render();

      	expect($(this.homeView.el)).toContain('#left-panel');
        
	});


});
});