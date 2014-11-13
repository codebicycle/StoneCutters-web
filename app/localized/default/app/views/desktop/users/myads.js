'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('users/myads');
var asynquence = require('asynquence');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'users_myads_view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        this.ads = this.ads || data.context.ctx.myAds;
        return _.extend({}, data, {
            myAds: this.ads
        });
    },
    events: {
        'click .btndelete': 'onDeleteClick',
        'click .btncanceldelete': 'onCancelDeleteClick',
        'click .backtomyolx': 'onCancelDeleteClick',
        'submit .formdelete': 'onSubmit',
        'click .btndelforever': 'onDeleteForever'
    },
    onDeleteClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $btndel = $(event.target);
        var itemId = $btndel.data('idd');
        var itemImg = $btndel.data('img');
        var itemTitle = $btndel.data('title');


        if (itemImg) {
            this.$('.confirmdelete .image img').attr('src',itemImg);
            this.$('.confirmdelete .image .withoutimg').hide();
        } else {
            this.$('.confirmdelete .image img').hide();
            this.$('.confirmdelete .image .withoutimg').show();
        }
        this.$('.confirmdelete .description').text(itemTitle);
        this.$('.my-items').hide();
        this.$('.formdeleteitem').find('#idd').val(itemId);
        this.$('.formdeleteitem').show();

    },
    onSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $form = $(event.target);
        var reason = this.$('.formdelete input[name="close_reason"]:checked').val();
        var reason_comment = this.$('.formdelete input[name="close_comment"]').val();
        var idd = this.$('.formdelete #idd').val();
        var user = this.app.session.get('user');
        var _params;

        var prepare = function(done) {
            _params = {
                token: user.token,
                userId: user.userId,
                location: this.app.session.get('siteLocation'),
                languageCode: this.app.session.get('selectedLanguage'),
                item_type: 'myAds'
            };

            done();
        }.bind(this);

        var findAds = function(done) {
            this.app.fetch({
                myAds: {
                    collection: 'Items',
                    params: _params
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var successmyads = function(res, _myAds) {
            this.ads = _myAds.myAds.toJSON();
            this.render();
        }.bind(this);

        var deleteitem = function(done) {
            helpers.dataAdapter.post(this.app.req, '/items/' + idd + '/delete', {
                query: {
                    token: user.token,
                    platform: this.app.session.get('platform'),
                    reason: reason,
                    comment: reason_comment
                }
            }, done.errfcb);
        }.bind(this);

        var success = function(res, _myAds) {
            asynquence().or(error)
                .then(prepare)
                .then(findAds)
                .val(successmyads);
        }.bind(this);

        var error = function(err) {
            console.log('Remove Item :: Error');
        }.bind(this);

        asynquence().or(error)
            .then(prepare)
            .then(deleteitem)
            .val(success);
    },
    onCancelDeleteClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        $('.formdeleteitem').hide();
        $('.my-items').show();
    },
    onDeleteForever: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $item = $(event.target);
        var content = $item.parents('li');
        var data = Base.prototype.getTemplateData.call(this);
        var key = data.dictionary['myolx.AreYouSureYouWantToCloseSelectedListings'];

        if(confirm(key)){
            //todo: sin implementar en smaug
            content.fadeOut();
        }
    }
});
