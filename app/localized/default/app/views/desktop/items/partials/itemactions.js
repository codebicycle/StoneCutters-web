'use strict';

var Base = require('../../../../../../common/app/bases/view');
var _ = require('underscore');
var helpers = require('../../../../../../../helpers');
var asynquence = require('asynquence');
var User = require('../../../../../../../models/user');

module.exports = Base.extend({
    className: 'item-actions',
    id: 'item-actions',
    events: {
        'click [data-fav]': 'addToFavorites',
        'submit [data-login-form]': 'login',
        'click [data-modal-close]': 'onCloseModal',
        'click .open-modal': 'onOpenModal',
        'click [data-modal-shadow]': 'onCloseModal'
    },
    addToFavorites: function (e) {
        var $this = $(e.currentTarget);
        var dataUser = $this.data('user');

        if (dataUser) {
            e.preventDefault();
            var user = this.app.session.get('user');
            var itemId = $this.data('itemid');
            var removeTxt = $this.attr('data-remove');
            var addTxt = $this.attr('data-add');
            var url = [];

            $this.attr('href', 'adding');

            url.push('/users/');
            url.push(user.userId);
            url.push('/favorites/');
            url.push(itemId);
            url.push(($this.attr('data-current') == 'add' ? '' : '/delete'));
            url.push('?token=');
            url.push(user.token);

            helpers.dataAdapter.post(this.app.req, url.join(''), {
                query: {
                    platform: this.app.session.get('platform')
                },
                cache: false,
                json: true,
                done: function() {
                    $this.attr('data-qa', $this.attr('data-qa') == 'add-favorite' ? 'remove-favorite' : 'add-favorite');
                    if ($this.attr('data-current') == 'add') {
                        $this.attr('data-current', 'remove');
                        $this.text(removeTxt);
                    } else {
                        $this.attr('data-current', 'add');
                        $this.text(addTxt);
                    }
                },
                fail: function() {
                    console.log('[OLX_DEBUG] Fail add to favorites :: ERROR');
                }
            }, function always() {
                $this.attr('href', '#');
            });
        }
    },
    login: function (event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var data = {
            usernameOrEmail: this.$('[name="usernameOrEmail"]').val(),
            password: this.$('[name="password"]').val()
        };
        var user;

        function prepare(done) {
            user = new User(_.extend(data, {
                location: this.app.session.get('siteLocation'),
                country: this.app.session.get('location').name,
                languageId: this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id,
                platform: this.app.session.get('platform')
            }), {
                app: this.app
            });
            done();
        }

        function submit(done) {
            user.login(done);
        }

        function success() {
            this.$('[data-fav]').attr('data-user', true).data('user', true).click();
            this.app.trigger('login', user);
            this.app.router.navigate(this.app.session.get('url'), {
                trigger: true,
                replace: true
            });
        }

        function error(err) {
            console.log(err);
        }

        asynquence().or(error.bind(this))
            .then(prepare.bind(this))
            .then(submit.bind(this))
            .val(success.bind(this));
    },
    onOpenModal: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        $('#modal-addfavorites-view').trigger('show');
    },
    onCloseModal: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        $('#modal-addfavorites-view').trigger('hide');
    }
});

module.exports.id = 'items/partials/itemactions';
