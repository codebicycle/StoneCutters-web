define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'models/user',
  'text!templates/login/loginTemplate.html',
  'config/conf',
  'crypto/md5',
  'crypto/sha512'
  ], 

  function($,_, Backbone, Handlebars, User, loginTemplate, Conf){

    var LoginView = Backbone.View.extend({
      el: "#home",

      events:{
        'click #login-button': "startLogin",
      },

      initialize: function(options){
        document.title = "Login";
        
        this.dfd = null || options.deferred;

        // Compile the template using Handlebars micro-templating
        this.loginCT = Handlebars.compile(loginTemplate);

        if (this.dfd) this.dfd.resolve(this);
      },
      render:function (){
        
        $(this.el).find('#content').html(this.loginCT({}));
        $(this.el).find('#content').trigger('create');

        return this;
      },
      startLogin:function (){
        this.username = $(this.el).find('#username-field').val();
        this.password = $(this.el).find('#password-field').val();

        if(!this.username || !this.password)
          return;

        //ATTENTION BEGIN DEBUG CODE
        // var user = new User({"id":100,"username":this.username});
        // this.Storage.set("userObj",user);
        // this.Storage.set("authToken","12345678");
        // this.eventAggregator.trigger("loggedIn");
        // window.location = "#";
        // return;
        //END OF DEBUG CODE

        $.ajax({
          type: "GET",
          url: Conf.get('smaug').url + ':' + Conf.get('smaug').port + '/users/challenge?u='+this.username,
        }).done(_.bind(this.challenge_success, this));
      },
      challenge_success:function (response){
        
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
        }).done(_.bind(this.login_success, this));

      },
      login_success:function (response){
        
        var data = null;
        if(typeof response == "string"){
          data = JSON.parse(response);
        }else{
          data=response;
        }

        if (data.token) {
          //this.Storage.set("authToken",data.token);

          this.user = new User({
            "username":data.username, 
            "authToken": data.token,
            "unreadMessagesCount": data.unreadMessagesCount,
            "favorites": data.favorites,
          });
          
          this.Storage.set("userObj",this.user);

          this.eventAggregator.trigger("loggedIn");
          window.location = "#";
        }else{
          alert('Wrong Username or password');
        }
        
      }
    });
    return LoginView;
});
