define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'constants/const',
  'collections/messages',
  'views/scroll/ScrollView',
  'text!templates/message/messagesTemplate.html',
  'text!templates/message/messagesListTemplate.html'
  ], 

  function($,_, Backbone, Handlebars, Const, MessagesCollection, ScrollView, 
    messagesTemplate, messagesListTemplate){

    var MyMessageListView = ScrollView.extend({
      el: "#home",
      className: "MyMessageListView",

      events: {
      },

      initialize: function(options){
        
        /*Compile the template using Handlebars micro-templating*/
        this.messagesCT = Handlebars.compile(messagesTemplate);
        this.messagesListCT = MyMessageListView.__super__.listTemplate = Handlebars.compile(messagesListTemplate);

        this.dfd = null || options.deferred;

        MyMessageListView.__super__.offset = options.page || 0;
        MyMessageListView.__super__.itemListId = "#message-list";

        var ops = {
          token: this.Storage.get("userObj").authToken,
          offset:MyMessageListView.__super__.offset,
          pageSize: Const.get(this.className).pageSize
        };

        var Opts = Backbone.Model.extend();
        MyMessageListView.__super__.query_options = new Opts(ops);
        this.query_options = MyMessageListView.__super__.query_options;

        this.messages = new MessagesCollection();
        MyMessageListView.__super__.collection =this.messages;
        this.messages.on('sync',_.bind(this.messages_success, this));
        this.messages.fetch({data: $.param(this.query_options.toJSON())});

        //Debug Code
       /*
        var collection = Backbone.Collection.extend();
        this.messages = new collection([ 

                                {"id":"484949563", "from":{"username":"Carlos Bernardi"}, "date":"03/07/2013",
                                 "title":"Chihuahua Puppies For Sale",
                                 "unread":true, 
                                 "message":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer iaculis volutpat consequat."},

                                {"id":"484949518", "from":{"username":"Santiago Villa Fernandez"}, "date":"04/07/2013",
                                 "title":"Gun Dog Stud Many Willowyck & Drakeshead Lns", 
                                 "unread":true,
                                 "message":"Vivamus eu felis sit amet augue venenatis pharetra a quis sem. Donec tortor dolor, faucibus non pulvinar et, vulputate non ipsum."},

                                {"id":"484949519", "from":{"username":"Ignacio Valdivieso"}, "date":"04/11/2012",
                                 "title":"Siberian Husky Female Puppy For Sale", 
                                 "unread":false,
                                 "message":"Pellentesque a nisl sit amet arcu iaculis suscipit."},

                                {"id":"484949520", "from":{"username":"Gonzalo Rey"}, "date":"05/08/2012",
                                 "title":"Black And Yellow Labrador Puppies", 
                                 "unread":false,
                                 "message":"Nunc rhoncus tortor a augue iaculis at faucibus magna iaculis. Curabitur vel odio at urna porta accumsan a ut lorem."},

                                {"id":"484949521", "from":{"username":"Damian Buonamico"}, "date":"05/09/2012",
                                 "title":"11 Week Old Kc Reg Lab Dog For Sale", 
                                 "unread":false,
                                 "message":"Morbi dignissim elit eu quam gravida quis feugiat massa dignissim. Donec eget tortor in mauris porttitor tristique."},

                                {"id":"484949522", "from":{"username":"Gonzalo Aizpun"}, "date":"06/11/2012",
           
                                 "title":"Stunning Litter Of K.c", 
                                 "unread":false,
                                 "message":"Morbi euismod, leo et vulputate placerat, erat sem cursus elit, nec bibendum dui neque a tortor. Suspendisse nisl nisl, dignissim venenatis auctor sagittis, scelerisque nec libero."},

                                {"id":"484949523", "from":{"username":"David Grandes"}, "date":"06/14/2012",
                                 "title":"Barney At Wolfabulls Bulldogs", 
                                 "unread":false,
                                 "message":"Mauris vulputate interdum magna porta placerat. Ut tristique ipsum malesuada metus vulputate vitae ullamcorper nisl scelerisque."},

                                {"id":"484949524", "from":{"username":"Gonzalo Rey"}, "date":"07/16/2012",
                                 "title":"Re: Chihuahua Puppies For Sale", 
                                 "unread":false,
                                 "message":"Quisque eget enim hendrerit felis ullamcorper adipiscing quis aliquam ipsum."},

                                {"id":"484949525", "from":{"username":"Santiago Villa"}, "date":"07/19/2012",
                                 "title":"Re: Black And Yellow Labrador Puppies", 
                                 "unread":false,
                                 "message":"Phasellus non nisl nec nisl posuere condimentum tempor sed arcu."},

                                {"id":"484949526", "from":{"username":"Carlos Bernardi"}, "date":"08/01/2012",
                                 "title":"Re: Stunning Litter Of K.c", 
                                 "unread":false,
                                 "message":"Curabitur eget lectus leo. Ut et mauris sed lacus tempus varius eget a tortor."},

                            ]);
        if (this.dfd) this.dfd.resolve(this);
        */
        //END Debug Code

        //ScrollView's settings
        this.templateKey = "messages";
        this.scrollingID = this.cid;
        MyMessageListView.__super__.bindScrolling.call(this);
      },

      render:function () {
        $(this.el).find('#content').html(this.messagesCT({'search-term': this.query}));
        $(this.el).find('#message-list').html(this.messagesListCT({'messages': this.messages.toJSON()}));
        return this;
      },

      messages_success: function(model, response)  {
        if (this.dfd) this.dfd.resolve(this);
        return;
      },
    });
    return MyMessageListView;
});
