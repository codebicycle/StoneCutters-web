
describe('The sliding menu',function(){
	
	var rootId = 'testContainer';
	
	//Create an easily-removed container for our tests to play in
	beforeEach(function() {
		var container = document.createElement('div');
		container.setAttribute('id',rootId);		
		document.body.appendChild(container);

	});
	
	//Clean it up after each spec
	afterEach(function() {
		var container = document.getElementById(rootId);
		container.parentNode.removeChild(container);
	});
		
	//Specs
	it('opens',function(){
		jasmine.getFixtures().fixturesPath = '../../../main/webapp/';
		loadFixtures('index.html');

		expect($('<div>some text</div>')).toHaveText('some text');

		console.log('asdasdasd');
		console.log($('#page1').text());
		console.log($('#jasmine-fixtures').text());

		expect($('#page1')).toHaveText("Loading....");

        
	});


});
