var RendrView = require('rendr/shared/base/view');

// Create a base view, for adding common extensions to our
// application's views.
module.exports = RendrView.extend({
    getTemplate: function(){
    	var template = global.template;
    	var name = this.name;
    	console.log("retrieving:"+template+"/"+name);
        return this.app.templateAdapter.getTemplate(template+"/"+name);
    }
});