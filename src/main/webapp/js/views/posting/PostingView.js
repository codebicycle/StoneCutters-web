define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'models/user',
  'text!templates/posting/postingTemplate.html',
  ], 

  function($,_, Backbone, Handlebars, User, postingTemplate, ConfModel){

    var PostingView = Backbone.View.extend({
      el: "#home",

      events:{
      },

      initialize: function(options){
        document.title = "Post item";
        
        this.dfd = null || options.deferred;

        // Compile the template using Handlebars micro-templating
        this.loginCT = Handlebars.compile(postingTemplate);

        if (this.dfd) this.dfd.resolve(this);
      },
      render:function (){
        
        $(this.el).find('#content').html(this.loginCT({}));
        $(this.el).find('#content').trigger('create');

        return this;
      },
    });
    return PostingView;
});
