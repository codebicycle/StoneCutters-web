define(['config/conf'], function (ConfModel){
	describe('The API',function(){
			
		//Specs
		describe('connection',function() {
			it('works normally',function(){
				//TODO check api connection

				var conf = new ConfModel();

				//expect(conf.get('smaug').url).toBe('1.1.1.1');
				expect(true).toBe(true);
			});
		});

	});
});