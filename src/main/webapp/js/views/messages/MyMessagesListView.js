define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'collections/messages',
  'config/conf',
  'text!templates/message/messagesListTemplate.html',
  'text!templates/message/messagesMoreListTemplate.html'
  ], 

  function($,_, Backbone, Handlebars, MessagesCollection, ConfModel, messagesListTemplate,messagesMoreListTemplate){

    var AdsListView = Backbone.View.extend({
      el: "#home",

      events: {
      },

      initialize: function(options){
        this.conf = new ConfModel();
        
        /*Compile the template using Handlebars micro-templating*/
        this.messagesCT = Handlebars.compile(messagesListTemplate);
        this.messagesMCT = Handlebars.compile(messagesMoreListTemplate);

        this.dfd = null || options.deferred;
        this.page= options.page || 0;
        this.pageSize =  10 || conf.get('pageSize');
        this.user_id = this.Storage.get("userObj").id;

        this.opts = {user_id:this.user_id, offset:this.page, pageSize: this.pageSize};

        this.messages = new MessagesCollection(this.opts);
        this.messages.on('sync',_.bind(this.messages_success, this));
        this.messages.fetch();

        //We are not able to attach this event in events: {}, because windows is not inside el.
        //Namespaced events. http://docs.jquery.com/Namespaced_Events (This is here to avoid a bug)
        $(window).bind("scroll."+this.user_id, (_.bind(this.checkScroll,this)));
      },

      checkScroll: function () {
        var triggerPoint = 100; // 100px from the bottom
        if( !this.isLoading && $(window).scrollTop() + $(window).height() + triggerPoint > $(document).height()  ) {
          this.opts.offset += 1; // Load next page
          this.messages.reset(this.opts);
          this.loadResults();
        }
      },

      loadResults: function () {
        this.messages.on('sync',_.bind(this.load_more_items, this));
        this.isLoading = true;
        this.messages.fetch();
      },

      load_more_items:function(items){
        $(this.el).find('#ads-list').append(this.messagesMCT({'messages': this.messages.toJSON(), 'search-term': this.query}));
        $(this.el).find('#ads-list').listview("refresh");
        this.isLoading = false;
        return this;
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

      close: function(){
        $(window).unbind("scroll."+this.user_id);
      }
    });
    return AdsListView;
});
