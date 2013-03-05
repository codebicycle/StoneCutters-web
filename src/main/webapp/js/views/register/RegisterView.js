define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'collections/items',
  'models/user',
  'text!templates/register/registerTemplate.html'
  ], 

  function($,_, Backbone, Handlebars, ItemsCollection, User, registerTemplate){

    var LoginView = Backbone.View.extend({
      el: "#home",

      events:{
        'click #register-button': "startRegister",
        'keypress input[type=email]': "startRegister"
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
          return;
        };

        var user = $(this.el).find('#username-field').val();
        var email = $(this.el).find('#email-field').val();
        var pass = $(this.el).find('#password-field').val();

        // this.user = new User({"username":user, "password":pass, "email":email});
        // this.user.register();

      },
      register_success:function (model, response){
        
      }
    });
    return LoginView;
});
