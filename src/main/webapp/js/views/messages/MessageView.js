define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'models/message',
  'text!templates/message/messageTemplate.html',
  'helpers/ScreenHelper'
  ], 

  function($,_, Backbone, Handlebars, MessageModel, 
    messageTemplate, ScreenHelper){

    var MessageView = Backbone.View.extend({
      el: "#home",

      events: {
      },

      initialize: function(options){
        
        /*Compile the template using Handlebars micro-templating*/
        this.messCT = Handlebars.compile(messageTemplate);
        this.dfd = options.deferred;

        this.message = new MessageModel({'id': options.id, 'token': this.Storage.get("userObj").authToken});
        this.message.on('sync',_.bind(this.success, this));
        this.message.fetch();

        //Debug Code
        
        // var m = Backbone.Model.extend();
        // this.message = new m({
        //     "id": 4653,
        //     "itemId": 47372355,
        //     "title": "python test",
        //     "countryId": 2,
        //     "toUserId": 2062073,
        //     "toEmail": "damian.buonamico@olx.com",
        //     "fromUserId": 2062073,
        //     "fromEmail": "damianb@olx.com",
        //     "fromName": "Damian",
        //     "phone": "47724545",
        //     "date": 1351083912,
        //     "read": true,
        //     "message": "Message with invalid unicode encoding:  asdf",
        //     "attachment": null,
        //     "attachmentId": null
        // });
        
        // this.dfd.resolve(this);
        
        //END Debug Code

      },
      render:function () {
        document.title = this.message.get('title');
        $(this.el).find('#content').html(this.messCT({'message': this.message.toJSON()}));

        return this;
      },
      success: function(model, response)  {
        this.dfd.resolve(this);
        return;
      },
    });
  return MessageView;
});
