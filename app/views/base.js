var RendrView = require('rendr/shared/base/view');

// Create a base view, for adding common extensions to our
// application's views.
module.exports = RendrView.extend({
    getTemplate: function(){
    	var platform = global.platform;
    	var name = this.name;
    	console.log("retrieving:"+platform+"/"+name);
        return this.app.templateAdapter.getTemplate(platform+"/"+name);
    }
});