define([
  'underscore',
  'backbone',
  'config/conf',
], function(_, Backbone,Conf){
	var LoginHelper = Backbone.Model.extend({
    
    makeLogin: function (username, password, callbackFunction) {
    	this.username = username;
    	this.password = password;
    	this.callback = callbackFunction;

    	$.ajax({
	      type: "GET",
	      url: Conf.get('smaug').url + ':' + Conf.get('smaug').port + '/users/challenge?u='+this.username,
	    }).done(_.bind(this._challenge_success, this));
    },

    _challenge_success:function (response){
        
        var data = null;
        if(typeof response == "string"){
          data = JSON.parse(response);
        }else{
          data=response;
        }
        
        this.challenge = data.challenge;

        var md5Hash = CryptoJS.MD5(this.password);
        var sha512Hash = CryptoJS.SHA512(md5Hash+this.username);

        $.ajax({
          type: "GET",
          url: Conf.get('smaug').url + ':' + Conf.get('smaug').port + 
          '/users/login?c=' + this.challenge + "&h=" + sha512Hash,
        }).done(_.bind(this.callback, this));
    }
  });

  return new LoginHelper();
});
