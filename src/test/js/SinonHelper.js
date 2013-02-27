define([
  'underscore',
  'backbone',
  'sinon'
], function(_, Backbone, sinon){
 	var SinonHelper = Backbone.Model.extend({
  	fakeResponse: function(actions, urls, responses, options, callback) {
		var statusCode, headers, server;

		// some default values, so we don't have to set status code and
		// content type all the time.
		statusCode = options.statusCode || 200;
		headers = options.headers || { "Content-Type": "application/json" }

		// we create what Sinon.js calls a fake server. This is basically just
		// a name for mocking out all XMLHttpRequests. (There are no actual
		// servers involved.)
		server = sinon.fakeServer.create();


		for (var i=0; i< actions.length; i++)
		{ 
			// we tell Sinon.js what we want to respond respondWith
			server.respondWith(actions[i], urls[i], [statusCode, headers, responses[i]]);
		}

		callback();
		
		// this actually makes Sinon.js respond to the Ajax request. As we can
		// choose when to respond to a request, it is for example possible to
		// test that spinners start and stop, that we handle timeouts
		// properly, and so on.
		server.respond();
		server.restore();
	}
  });
  
  // Return the model for the module
  return SinonHelper;
});