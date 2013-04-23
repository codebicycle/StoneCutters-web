define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'collections/fields',
  'models/item',
  'text!templates/posting/postingTemplate.html',
  ], 

  function($,_, Backbone, Handlebars, FieldCollection, ItemModel, postingTemplate){

    var PostingView = Backbone.View.extend({
      el: "#home",

      events:{
        'click #post-button': "startPosting",
      },

      initialize: function(options){
        document.title = "Post item";
        
        this.dfd = null || options.deferred;

        // Compile the template using Handlebars micro-templating
        this.postingCT = Handlebars.compile(postingTemplate);

        this.item = new ItemModel({id:0});

        this.fields = new FieldCollection({country_id:1, category_id:4});
        this.fields.on('sync',_.bind(this.fieldsSuccess, this));
        this.fields.fetch();

        // this.fields = new FieldCollection([{type:"text-1", title:"Title", name:"title"},
        //   {type:"text-2", title:"Description", name:"desc"},
        //   {type:"radio", title:"Type of ad", opts:["Buy","Sell"], name:"typeOfAd"},
        //   {type:"combo", title:"Currency", opts:["ARS","USD"], name:"currency"},
        //   {type:"check", title:"Has furniture", name:"hasFurniture"},
        //   {type:"slider", title:"Number of Bedrooms", name:"nOfBedrooms", min:1, max:10, step:1},
        //   {type:"imgs", title:"Add images", name:"image"},]);
        // if (this.dfd) this.dfd.resolve(this);


      },
      render:function (){
        
        $(this.el).find('#content').html(this.postingCT({fields:this.fields.toJSON()}));
        $(this.el).find('#content').trigger('create');

        $(this.el).find('#breadcrumb').hide();

        $('input[class*=in],select[class*=in],textarea[class*=in]').change(function(ev){
          var name = $(ev.currentTarget).attr('name');
          var value;

          if($(ev.currentTarget).attr('class') == "in-check")
            value = $(ev.currentTarget).is(":checked");
          else
            value = $(ev.currentTarget).val();

          this.item.set(name,value);
        });

        return this;
      },
      fieldsSuccess: function(model, response){
        if (this.dfd) this.dfd.resolve(this);
      },
      startPosting:function (){
        this.item.save({error:_.bind(this.postFail, this), 
          success:_.bind(this.postSuccess, this)});
      },
      postFail:function (){
        
      },
      postSuccess:function (){
        
      },
    });
    return PostingView;
});
