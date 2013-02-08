define([
  'underscore',
  'backbone',
  // Pull in the Model module from above
  'models/category',
  'config/conf'
], function(_, Backbone, CategoryModel, ConfModel){
	var conf = new ConfModel();
  	var CategoryCollection = Backbone.Collection.extend({
    	model: CategoryModel,
    	url: conf.get('smaug').url + ':' + conf.get('smaug').port + '/categories/1'
  	});
  	// You don't usually return a collection instantiated
  	return CategoryCollection;
});