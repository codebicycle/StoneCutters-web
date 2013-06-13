define([
    'jquery',
    'underscore',
    'backbone',
    'handlebars',
    'collections/fields',
    'models/item',
    'text!templates/posting/postingStep1Template.html',
    'text!templates/posting/postingStep2Template.html',
    'text!templates/posting/postingStep3Template.html',
    'text!templates/widgets/comboBoxTemplate.html',
    'helpers/CategoryHelper'
  ], 

  function($,_, Backbone, Handlebars, FieldCollection, ItemModel, 
    postingStep1Template, postingStep2Template, postingStep3Template, 
    comboBoxTemplate, CategoryHelper){

    var PostingView = Backbone.View.extend({
      el: "#home",

      events:{
        'click #next-p0-button': 'showPage',
        'click #back-p1-button': 'showPage',
        'click #next-p1-button': 'showPage',
        'click #back-p2-button': 'showPage',
        'click #post-button':    'makePosting',
        'click #save-button':    'savePosting',
        'change #category':   'loadSubcategory'
      },

      initialize: function(options){
        // document.title = "Post item";
        this.dfd = null || options.deferred;

        // Compile the template using Handlebars micro-templating
        this.postingStep1CT = Handlebars.compile(postingStep1Template);
        this.postingStep2CT = Handlebars.compile(postingStep2Template);
        this.postingStep3CT = Handlebars.compile(postingStep3Template);
        this.postingStep3CT = Handlebars.compile(postingStep3Template);
        this.comboBoxCT = Handlebars.compile(comboBoxTemplate);

        this.item = new ItemModel();
        this.fields = new FieldCollection([
         {type:"text", name:"title", label:"My Title",description:"this is a description"},
         {type:"textarea", label:"Description", name:"description"},
         {type:"radio", label:"Type of ad", values:[{key: 1,value: "Vendo"},{key: 2,value: "Compro"}], name:"typeOfAd"},
         {type:"combobox", label:"Currency", values:[{key: 1,value: "ARS"},{key: 2,value: "US"}], name:"currency"},
         {type:"password", label:"Password", name:"Password"},
         {type:"email", label:"Email", name:"email", min:1, max:10, step:2},
         {type:"url", label:"My website", name:"myWebsite"},
         {type:"range", label:"Number of Bedrooms", name:"nOfBedrooms", min:1, max:10, step:1},
         {type:"image", label:"Add images", name:"image"},
         {type:"checkbox", label:"Mayor de edad", name:"typeOfPerson"}
        ]);

        this.fields.on('sync',_.bind(this.fieldsSuccess, this));
        

        this.categories = CategoryHelper.categories;
        if(this.categories.length == 0){
          CategoryHelper.categories.on('sync',_.bind(this.cat_success, this));
        }else{
          if (this.dfd) this.dfd.resolve(this);
        }

        // this.fields = new FieldCollection({country_id:1, category_id:4});
        // this.fields.on('sync',_.bind(this.fieldsSuccess, this));
        // this.fields.fetch();

        // this.fields = new FieldCollection([{type:"text-1", title:"Title", name:"title"},
        //   {type:"text-2", title:"Description", name:"desc"},
        //   {type:"radio", title:"Type of ad", opts:["Buy","Sell"], name:"typeOfAd"},
        //   {type:"combo", title:"Currency", opts:["ARS","USD"], name:"currency"},
        //   {type:"check", title:"Has furniture", name:"hasFurniture"},
        //   {type:"slider", title:"Number of Bedrooms", name:"nOfBedrooms", min:1, max:10, step:1},
        //   {type:"imgs", title:"Add images", name:"image"},]);
        
      },

      cat_success: function(){
        if (this.dfd) this.dfd.resolve(this);
      },

      loadSubcategory: function(ev){
        var selectedIndex = ev.target.selectedIndex;
        $(this.el).find('#subcategories').html(this.comboBoxCT({id:"subcategory", name:"subcategory", items:this.categories.models[selectedIndex].get('children')}));
        $(this.el).find('#content').trigger('create');
      },

      render:function (posting_step){
        //posting_step: 0,1,2
        posting_step = posting_step || 0;

        switch(posting_step)
        {
          case 0:
            $(this.el).find('#content').html(this.postingStep1CT({categories:this.categories.toJSON()}));
            $(this.el).find('#subcategories').html(this.comboBoxCT({id:"subcategory", name:"subcategory", items:this.categories.models[0].get('children')}));
            $(this.el).find('#content').trigger('create');
          break;
          case 1:
            this.buildItem(posting_step);
            /*TODO This should be uncomment the following line and delete the call to field succes*/
            //this.fields.fetch();
            this.fieldsSuccess();

          break;
          case 2:
            this.buildItem(posting_step);
            $(this.el).find('#content').html(this.postingStep3CT());
            $(this.el).find('#content').trigger('create');
          break;
        }
        
        $(this.el).find('#breadcrumb').hide();
        return this;
      },
      
      buildItem: function(posting_step){
        // posting_step: 1 means that I am going to the second step.
        // posting_step: 2 means that I am going to the last step.
        // posting_step: 3 means that it is the last step.
        switch(posting_step)
        {
          case 1:
            var title = $(this.el).find('#content #title').text();
            var categoryID = $(this.el).find('#content #category').val()
            var subcategoryID = $(this.el).find('#content #subcategory').val();
            var countryId = 'www.olx.com';  //TODO We must create a Country Helper

            this.item.set({title: title});
            this.item.set({category: {id: subcategoryID, parentId:categoryID}});
            
            //I set the require fields in order to get the optionals fields 
            //for this this
            this.fields.countryId = countryId;
            this.fields.parentCategoryId= categoryID;
            this.fields.categoryId = subcategoryID;
          break;
          case 2:
            
            var fields = this.fields.toJSON();
            var value = null;
            var opts = new Backbone.Model();
            
            for (var i = 0; i < fields.length; i++) {
              if(fields[i].type == "radio" ){
                var value = $('input[name='+fields[i].name+']:checked', '#postingForm').val()
                opts.set(fields[i].name,value);
              }else if(fields[i].type == "combobox"){
                opts.set(fields[i].name, $('option[name='+fields[i].name+']:selected', '#postingForm').val());
              }else if(fields[i].type == "checkbox"){
                opts.set(fields[i].name,$('#checkbox-'+fields[i].name).prop('checked'));
              }else if(fields[i].type == "image"){
                //TODO Image posting
              }else{
                opts.set(fields[i].name,$(this.el).find('#'+fields[i].type+'-'+fields[i].name).val());
              }
            };
            
            this.item.set({opts:opts.toJSON()});
          break;
          case 3:
            var contactName = $(this.el).find('#content #contact-name').val();
            var email = $(this.el).find('#content #email').val();
            var phone = $(this.el).find('#content #phone-number').val();
            var adAddress = $(this.el).find('#content #ad-address').val();

            //this.item.set({contactName: contactName});
            //this.item.set({adAddress:adAddress});
            this.item.set({email: email});
            this.item.set({phone: phone});
          break;
        }
        return;
      },

      fieldsSuccess: function(){
        $(this.el).find('#content').html(this.postingStep2CT({fields:this.fields.toJSON()}));
        $(this.el).find('#content').trigger('create');
      },
      
      showPage: function(ev){
        var dest = $(ev.target).data('destiny');
        this.render(dest);
      },

      showPosting: function(){
        this.render(1);
      },
      /*fieldsSuccess: function(model, response){
        if (this.dfd) this.dfd.resolve(this);
      },*/
      startPosting:function (){
        this.item.save({error:_.bind(this.postFail, this), 
          success:_.bind(this.postSuccess, this)});
      },

      postFail:function (){
        
      },

      postSuccess:function (){
        
      },
      makePosting: function(){
        debugger
        this.buildItem(3);
        this.item.save(null, {
          success:function(model,response){
            console.log("success");
          },
          error:function(model,response){
            console.log("error");
          }
        });
      }
    });
    return PostingView;
});
