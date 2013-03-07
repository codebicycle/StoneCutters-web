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

  function($,_, Backbone, Handlebars, User, loginTemplate, ConfModel){

    var LoginView = Backbone.View.extend({
      el: "#home",

      events:{
        'click #login-button': "startLogin",
        'keypress input[type=text]': "startLogin",
        'click #send-email-button': "startLoginEmail",
        'keypress input[type=email]': "startLoginEmail"
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

        var conf = new ConfModel();

        $.ajax({
          type: "GET",
          url: conf.get('smaug').url + ':' + conf.get('smaug').port + '/challenge?user='+this.username,
        }).done(_.bind(this.challenge_success, this));
      },
      challenge_success:function (data){
        this.challenge = data.challenge;

        var md5Hash = CryptoJS.MD5(this.password);
        var sha512Hash = CryptoJS.SHA512(md5Hash+this.challenge);

        $.ajax({
          type: "POST",
          url: conf.get('smaug').url + ':' + conf.get('smaug').port + '/login',
          data: "{'username':"+this.username+",'password':"+sha512Hash+"}",
        }).done(_.bind(this.login_success, this));
        
      },
      login_success:function (data){
        if (data.token) {
          window.token = data.token;

          this.user = new User({"username":this.username});
          this.user.on('sync',_.bind(this.user_success, this));
          this.user.fetch();
        };
        
      },
      user_success:function (model, response){
        if(this.user.username){
          window.user = this.user;
        }
        
      },
      startLoginEmail:function (){
        var email = $(this.el).find('#email-field').val();

        // this.user = new User({"username":user, "password":pass});
        // this.user.on('sync',_.bind(this.login_success, this));
        // this.user.fetch();
      },
      login_email_success:function (model, response){
        
      },
    });
    return LoginView;
});
