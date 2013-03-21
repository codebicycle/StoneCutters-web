define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'collections/messages',
  'views/scroll/ScrollView',
  'text!templates/message/messagesListTemplate.html',
  'text!templates/message/messagesMoreListTemplate.html'
  ], 

  function($,_, Backbone, Handlebars, MessagesCollection, ScrollView, messagesListTemplate,messagesMoreListTemplate){

    var MyMessageListView = ScrollView.extend({
      el: "#home",

      events: {
      },

      initialize: function(options){
        
        /*Compile the template using Handlebars micro-templating*/
        this.messagesCT = Handlebars.compile(messagesListTemplate);
        MyMessageListView.__super__.moreTemplate = Handlebars.compile(messagesMoreListTemplate);

        this.dfd = null || options.deferred;

        MyMessageListView.__super__.offset = options.page || 0; 
        this.pageSize =  10;
        this.user_id = this.Storage.get("userObj").id;

        this.opts = {user_id:this.user_id, offset:MyMessageListView.__super__.offset, pageSize: this.pageSize, token:this.Storage.get("userObj").authToken};

        this.messages = new MessagesCollection(this.opts);
        MyMessageListView.__super__.collection =this.messages;
        this.messages.on('sync',_.bind(this.messages_success, this));
        this.messages.fetch();

        //ScrollView's settings
        this.templateKey = "messages";
        this.scrollingID = "myMessages"+this.user_id;
        MyMessageListView.__super__.bindScrolling.call(this);
      },

      render:function () {
        $(this.el).find('#content').html(this.messagesCT({'messages': this.messages.toJSON(), 'search-term': this.query}));
        $(this.el).find('#ads-list').listview();
        return this;
      },

      messages_success: function(model, response)  {
        if (this.dfd) this.dfd.resolve(this);
        return;
      },
    });
    return MyMessageListView;
});
