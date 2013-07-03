define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'models/user',
  'text!templates/register/registerTemplate.html',
  'helpers/LoginHelper'
  ], 

  function($,_, Backbone, Handlebars, UserModel, registerTemplate, LoginHelper){

    var LoginView = Backbone.View.extend({
      el: "#home",

      events:{
        'click #register-button': "startRegister"
      },

      initialize: function(options){
        document.title = "Register";
        
        this.dfd = null || options.deferred;

        // Compile the template using Handlebars micro-templating
        this.registerCT = Handlebars.compile(registerTemplate);

        if (this.dfd) this.dfd.resolve(this);
      },
      
      render:function (){
        
        $(this.el).find('#content').html(this.registerCT({}));
        $(this.el).find('#content').trigger('create');

        return this;
      },

      startRegister:function (){
        if (!$(this.el).find('#agree-check').is(':checked')) {
          console.log("You must accept terms and conditions.");
          return;
        };

        this.username = $(this.el).find('#username-field').val();   
        this.email = $(this.el).find('#email-field').val();   
        this.password = $(this.el).find('#password-field').val();   
        
        var tentativeUser = new UserModel();

        tentativeUser.set({username: this.username});   
        tentativeUser.set({email: this.email});   
        tentativeUser.set({password: this.password});   
        
        //This will be hardcoded until location is implemented.
        tentativeUser.set({location: "losangeles.olx.com"});   
        tentativeUser.set({languageId: 1});

        tentativeUser.save(null, {
          success:_.bind(function(model,response){
            console.log("success");
            LoginHelper.makeLogin(this.username, this.password,_.bind(this.login_success,this));
          },this),
          error:_.bind(function(model,response){
            console.log("errors creating a new user");
          },this)
        });

        // this.user = new User({"username":user, "password":pass, "email":email});
        // this.user.register();
      },
      login_success:function(response){
        var data = null;
        if(typeof response == "string"){
          data = JSON.parse(response);
        }else{
          data=response;
        }

        if (data.token) {
          this.user = new UserModel({
            "userId":data.userId,
            "username":data.username, 
            "authToken": data.token,
            "unreadMessagesCount": data.unreadMessagesCount,
            "favorites": data.favorites,
          });
          
          this.Storage.set("userObj",this.user);
          this.eventAggregator.trigger("loggedIn");
          this.eventAggregator.trigger("openLeftPannel");
          window.location = "#";
        }else{
          alert('Wrong Username or password');
        }
      }
    });
    return LoginView;
});
