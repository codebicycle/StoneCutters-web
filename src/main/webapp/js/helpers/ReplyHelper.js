//Singleton class. See the return line
define([
  'underscore',
  'backbone',
  'config/conf',
], function(_, Backbone, Conf){
  var ReplyHelper = Backbone.Model.extend({
    el: "#home",
    defaults:{

    },
    postReply: function(itemId){
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
          '/items/'+itemId+'/messages',
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

  return new ReplyHelper();
});