define(['helpers/JSONHelper'], function(JSONHelper) {
	
	describe('The jsonHelper',function(){
	
		var callbacks = {};

		// //Create an easily-removed container for our tests to play in
		// beforeEach(function() {
		// });

		// afterEach(function () {
			
		// 	expect(callbacks.doneItems).toHaveBeenCalled();
		// });
		
		//Specs
		it('should concat two json documents',function(){
			var json1 = {'prop1':'JSON1','prop2':'JSON2','prop3':'JSON3'};
			var json2 = {'prop4':'JSON4','prop5':'JSON5','prop6':'JSON6'};

			var resp = JSONHelper.concatJSON(json1,json2);
			expect(resp.prop6).toBe("JSON6");
		});

		it('should parse a title',function(){
			var json1 = {'prop1':'JSON1','prop2':'JSON2','prop3':'JSON3'};
			var resp = JSONHelper.parseTitleValue(json1);

			expect(resp[0]['title']).toBe("prop1");
			expect(resp[2]['value']).toBe("JSON3");
		});

		it('should parse query string',function(){
			var queryString = "prop1=value1&prop1=value1&prop2=value2&prop3=value3";
			var resp = JSONHelper.parseQueryString(queryString);

			expect(resp['prop1']).toBe("value1");
			expect(resp.prop3).toBe("value3");
		});

		it('should convert json to querystring',function(){
			var json = {"prop1":"value1","prop2":"value2","prop3":"value3"};
			var resp = JSONHelper.jsonToQueryString(json);
			expect(resp).toBe("?prop1=value1&prop2=value2&prop3=value3");
		});
	});
});