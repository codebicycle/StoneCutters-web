define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'models/message',
  'text!templates/message/messageTemplate.html',
  'helpers/ScreenHelper',
  'config/conf',
  ], 

  function($,_, Backbone, Handlebars, MessageModel, 
    messageTemplate, ScreenHelper, Conf){

    var MessageView = Backbone.View.extend({
      el: "#home",

      events: {
        'click #reply-button': "postReply",
      },

      initialize: function(options){
        
        /*Compile the template using Handlebars micro-templating*/
        this.messCT = Handlebars.compile(messageTemplate);
        this.dfd = options.deferred;

        this.message = new MessageModel({'id': options.id});
        this.message.on('sync',_.bind(this.success, this));
        //the data param adds query parameters to the fetch url
        this.message.fetch({data: $.param({
          token: this.Storage.get("userObj").authToken
        })});

        //Debug Code
        /*
         var m = Backbone.Model.extend();
         this.message = new m({
             "id": 4653,
             "itemId": 47372355,
             "title": "python test",
             "countryId": 2,
             "toUserId": 2062073,
             "toEmail": "damian.buonamico@olx.com",
             "fromUserId": 2062073,
             "fromEmail": "damianb@olx.com",
             "fromName": "Damian",
             "phone": "47724545",
             "date": 1351083912,
             "read": true,
             "message": "Message with invalid unicode encoding:  asdf",
             "attachment": null,
             "attachmentId": null
         });
        
         this.dfd.resolve(this);
        */
        //END Debug Code

      },
      render:function () {
        document.title = this.message.get('title');
        $(this.el).find('#content').html(this.messCT({'message': this.message.toJSON()}));
        $(this.el).find('#content').trigger('create');
        return this;
      },
      success: function(model, response)  {
        this.dfd.resolve(this);
        return;
      },
      postReply: function(){
        var name = $(this.el).find('#name-field').val();
        var email = $(this.el).find('#email-field').val();
        var phone = $(this.el).find('#phone-field').val();
        var message = $(this.el).find('#message-field').val();
        var user = this.Storage.get("userObj");

        if(!message){
          //TODO show error here
          return;
        }

        var postData = {};

        if (email)
          postData.email = email;
        if (message)
          postData.message = message;
        if (name)
          postData.name = name;
        if (phone)
          postData.phone = phone;
        if (user)
          postData.userId = user.userId;

        $.ajax({
          type: "POST",
          url: Conf.get('smaug').url + ':' + Conf.get('smaug').port + 
          '/items/'+this.message.get("itemId")+'/messages',
          data: postData
        }).done(_.bind(this.reply_done, this));
      },
      reply_done: function(model, response){
        $(this.el).find('#name-field').val("");
        $(this.el).find('#email-field').val("");
        $(this.el).find('#phone-field').val("");
        $(this.el).find('#message-field').val("");
        alert("Successfully replied to ad");
      }
    });
  return MessageView;
});
