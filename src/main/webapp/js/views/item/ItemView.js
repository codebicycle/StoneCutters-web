define([
  'jquery',
  'underscore',
  'backbone',
  'swipe',
  'handlebars',
  'models/item',
  'collections/items',
  'text!templates/item/itemTemplate.html',
  'text!templates/widgets/imageGalleryTemplate.html',
  'text!templates/widgets/itemGalleryTemplate.html',
  'text!templates/base/breadcrumbTemplate.html',
  'helpers/ScreenHelper',
  'helpers/CategoryHelper'
  ], 

  function($,_, Backbone, sw, Handlebars, ItemModel, ItemsCollection, 
    itemTemplate, imageGalleryTemplate, itemGalleryTemplate, breadcrumbTemplate, 
    ScreenHelper, CategoryHelper){

    var ItemView = Backbone.View.extend({
      el: "#home",

      events: {
        'click .call': 'callSeller',
        'click .sms': 'smsSeller',
        'click .message': 'messageSeller',
        'click .collapse' : 'collapseSection',
      },

      initialize: function(options){
        
        /*Compile the template using Handlebars micro-templating*/
        this.itemCT = Handlebars.compile(itemTemplate);
        this.imgsCT = Handlebars.compile(imageGalleryTemplate);
        this.relAdsCT = Handlebars.compile(itemGalleryTemplate);
        this.breadCT = Handlebars.compile(breadcrumbTemplate);
        this.dfd = options.deferred;

        this.item = new ItemModel({'id': options.id});
        this.item.on('sync',_.bind(this.success, this));
        this.item.fetch();

        this.relatedAds = new ItemsCollection({"item_type":"adsList"});
        this.relatedAds.on('sync',_.bind(this.related_ads_success, this));
        this.relatedAds.fetch({data: $.param({
          location:"www.olx.com",
          relatedTo:options.id,
          filters:"[{'name':'withPhotos', 'value':'true'}]"
        })});

        //Debug Code
        /*
        var m = Backbone.Model.extend();
        this.item = new m({
          "location":{"latitude":48.853068,"longitude":2.350302, "city":"Paris"},
          "username":"cbernardi",
          "description":"Little Manda is the most beautiful little female Chihuahua puppy. She is going to be really small...and she is definitely going to steal your heart! Her mom and dad are both long haired Chihuahuas! Little Manda has been raised around children since birth and has a super good nature. She is up to date with all her worming and vaccinations, also she is really doing good with potty training! If you would like to send a deposit, $100.00 will hold her for you! There is a shipping fee of $250.00 to send Manda to her new family. I do accept pay pal as one form of payment for my puppies...you can use your credit card also! If you are looking for a precious little companion... little Manda will be a wonderful choice! Just send me an email or call 417-260-3004 and I will be happy to start adoption procedures!",
          "price":250.0,"id":484949178,"date":"2013-02-22",
          "displayPrice":"$250",
          "category":{"id":812,"name":"Dogs","parentId":17},
          "parentCategory":{"id":17,"name":"For Sale"},
          "optionals":[
              {"key":"Gender", "value":"Female"},
              {"key":"Age", "value":"19 Weeks"},
              {"key":"Color", "value":"Fawn"},
              {"key":"Champion Bloodlines", "value":"Yes"}
          ],
          "title":"Chihuahua Puppies For Sale",
          "myOLXData":{"favorite":false,"onApproval":false},
          "images":[
              {"url":"http://petliferadio.com/doggydog.jpg","thumbUrl":"http://petliferadio.com/doggydog.jpg","displayOrder":1},
              {"url":"http://static.ddmcdn.com/gif/bad-dog-training-behavior-300.jpg","thumbUrl":"http://static.ddmcdn.com/gif/bad-dog-training-behavior-300.jpg","displayOrder":2},
              {"url":"http://www.theworld.org/wp-content/uploads/Q-dog-300x300.jpg","thumbUrl":"http://www.theworld.org/wp-content/uploads/Q-dog-300x300.jpg","displayOrder":3},
              {"url":"http://img.ehowcdn.com/article-new/ehow/images/a04/qu/7b/signs-symptoms-dog-food-poisoning-800x800.jpg","thumbUrl":"http://img.ehowcdn.com/article-new/ehow/images/a04/qu/7b/signs-symptoms-dog-food-poisoning-800x800.jpg","displayOrder":4},
              {"url":"http://dogwalking.dogster.com/wp-content/themes/alcottTheme/uploads/Dog-Park-Safety.jpg","thumbUrl":"http://dogwalking.dogster.com/wp-content/themes/alcottTheme/uploads/Dog-Park-Safety.jpg","displayOrder":5}
          ],
          "phone":"3196451872",
          "relatedAds":[ 
              {"id":"484949563", "title":"Chihuahua Puppies For Sale","thumbImage":"http://petliferadio.com/doggydog.jpg"},
              {"id":"484949178", "title":"Gun Dog Stud Many Willowyck & Drakeshead Lns","thumbImage":"http://www.cck9.com/wp-content/uploads/2009/09/German-shepherd-protection-dogs-CCK9-Blog-300x300.jpg"},
              {"id":"484940969", "title":"Siberian Husky Female Puppy For Sale","thumbImage":"http://static.ddmcdn.com/gif/bad-dog-training-behavior-300.jpg"},
              {"id":"484940652", "title":"Black And Yellow Labrador Puppies","thumbImage":"http://assets.archivhadas.es/system/tog_forum/topics/images/5395/big_perro-dog-cl.jpg"},
              {"id":"484939846", "title":"11 Week Old Kc Reg Lab Dog For Sale","thumbImage":"http://dogwalking.dogster.com/wp-content/themes/alcottTheme/uploads/Dog-Park-Safety.jpg"},
              {"id":"484937518", "title":"Stunning Litter Of K.c","thumbImage":"http://img.ehowcdn.com/article-new/ehow/images/a04/qu/7b/signs-symptoms-dog-food-poisoning-800x800.jpg"},
              {"id":"484936416", "title":"Barney At Wolfabulls Bulldogs","thumbImage":"http://www.theworld.org/wp-content/uploads/Q-dog-300x300.jpg"},
          ]
        });
        
        */
        //END Debug Code

      },
      render:function () {
        document.title = this.item.get('title');

        $(this.el).find('#content').html(this.itemCT({'item': this.item.toJSON()}));

        if (CategoryHelper.categories.length > 0) {
          var parentId = this.item.get('category').parentId;

          $(this.el).find('#breadcrumb').show();
          $(this.el).find('#breadcrumb').html(this.breadCT({
            // 'itemId':this.item.get('id'),
            // 'itemName':this.item.get('title'),
            'sCat':this.item.get('category').id,
            'sCatName':this.item.get('category').name,
            'pCat':parentId,
            'pCatName':CategoryHelper.categories.get(parentId).get('name')
          }));
        };

        $(this.el).find('#image-slider').html(this.imgsCT({'imgs': this.item.get('images')}));

        this.slider = new Swipe(document.getElementById('image-slider'), {
                            //startSlide: 2,
                            //speed: 400,
                            //auto: 3000,
                            'items':ScreenHelper.getImgsNum(),
                            'callback': function(event, index, elem) {
                            }

        });

        this.related_ads_success(null,null);

        $(window).resize(_.bind(function() {
          this.slider.items = ScreenHelper.getImgsNum();
          this.sliderRelated.items = ScreenHelper.getImgsNum();
        },this));

        window.scrollTo(0,0);

        return this;
      },
      success: function(model, response)  {
        this.dfd.resolve(this);
        return;
      },
      related_ads_success: function(model, response){
        $(this.el).find('#image-slider-related').html(this.relAdsCT({'item': this.relatedAds.toJSON()}));
        this.sliderRelated = new Swipe(document.getElementById('image-slider-related'), {
                            //startSlide: 2,
                            //speed: 400,
                            //auto: 3000,
                            'items':ScreenHelper.getImgsNum(),
                            'callback': function(event, index, elem) {
                            }
        });
      },
      callSeller: function(e){
        if (this.item.get('phone')) {
          window.location = "callto:"+this.item.get('phone');
        }else{
          alert("This user did not provide a phone number");
        };
      },
      smsSeller: function(){
        if (this.item.get('phone')) {
          window.location = "sms:"+this.item.get('phone');
        }else{
          alert("This user did not provide a phone number");
        };
      },
      messageSeller: function(){
        
      }
    });
  return ItemView;
});
