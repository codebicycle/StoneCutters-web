define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'models/user',
  'text!templates/register/registerTemplate.html'
  ], 

  function($,_, Backbone, Handlebars, UserModel, registerTemplate){

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
        debugger
        if (!$(this.el).find('#agree-check').is(':checked')) {
          console.log("You must accept terms and conditions.");
          return;
        };
        var tentativeUser = new UserModel();

        tentativeUser.set({username: $(this.el).find('#username-field').val()});   
        tentativeUser.set({email: $(this.el).find('#email-field').val()});   
        tentativeUser.set({password: $(this.el).find('#password-field').val()});   
        
        //This will be hardcoded until location is implemented.
        tentativeUser.set({location: "losangeles.olx.com"});   
        tentativeUser.set({languageId: 1});

        /*tentativeUser.save(null, {
          success:function(model,response){
            console.log("success");
          },
          error:function(model,response){
            console.log("errors creating a new user");
          }
        });*/


        // this.user = new User({"username":user, "password":pass, "email":email});
        // this.user.register();

      }
    });
    return LoginView;
});
