define(['views/home/HomeView'], function(HomeView) {
describe('The sliding menu',function(){
	
	var rootId = 'testContainer';
	
	//Create an easily-removed container for our tests to play in
	beforeEach(function() {
		var container = document.createElement('div');
		container.setAttribute('id',rootId);		
		document.body.appendChild(container);

		setFixtures('<div id="home"></div>');
		this.homeView = new HomeView();

	});
	
	//Clean it up after each spec
	afterEach(function() {
		var container = document.getElementById(rootId);
		container.parentNode.removeChild(container);
	});
		
	//Specs
	it('opens',function(){
 
      	$(this.homeView.el).attr('data-role', 'page');
      	this.homeView.render();

      	expect($(this.homeView.el)).toContain('#left-panel');
        
	});


});
});