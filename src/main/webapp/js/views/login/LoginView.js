define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'collections/items',
  'models/user',
  'text!templates/login/loginTemplate.html'
  ], 

  function($,_, Backbone, Handlebars, ItemsCollection, User, loginTemplate){

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
        var user = $(this.el).find('#username-field').val();
        var pass = $(this.el).find('#password-field').val();

        // this.user = new User({"username":user, "password":pass});
        // this.user.on('sync',_.bind(this.login_success, this));
        // this.user.fetch();
      },
      login_success:function (model, response){
        
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
