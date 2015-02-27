'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('users/facebooklogin');
var _ = require('underscore');
var asynquence = require('asynquence');
var User = require('../../../../../../models/user');
var config = require('../../../../../../../shared/config');

module.exports = Base.extend({
    className: 'users_facebook_login',
    user: {},
    // fromItem: false,
    redirectTo: '',
    events: {
        'click [data-facebook-login]': 'facebookLogin'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var location = this.app.session.get('location');
        var facebooklogin = config.getForMarket(location.url, ['socials', 'facebookLogin'], false);

        return _.extend({}, data, {
            facebookLogin: facebooklogin
        });
    },
    postRender: function() {
        window.fbAsyncInit = function (){
            window.FB.init({
                appId      : '168791636471880',
                cookie     : true,
                xfbml      : true,
                version    : 'v2.1'
            });
        }.bind(this);

        (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {return;}
            js = d.createElement(s); js.id = id;
            js.src = '//connect.facebook.net/en_US/sdk.js';
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));

        this.listenTo(this.app, 'loginFromItem', function(data) {
            this.redirectTo = data.redirectTo;
        });
    },
    facebookLogin: function() {
        window.FB.login(this.statusChangeCallback.bind(this), {
            scope: 'public_profile, email'
        });
    },
    checkLoginState: function() {
        window.FB.getLoginStatus(this.statusChangeCallback.bind(this));
    },
    statusChangeCallback: function(response) {
        var token;

        if (response.status === 'connected') {
            token = response.authResponse.accessToken;

            window.FB.api('/me', function(response) {
                this.appLogin(response, token);
            }.bind(this));
        }
    },
    register: function(response, token) {
        function prepare(done) {
            this.user = new User(_.extend({
                facebookId: response.id,
                facebookToken: token,
                email: response.email,
                location: this.app.session.get('siteLocation'),
                languageId: this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id,
                languageCode: this.app.session.get('languageCode'),
                fullname: response.name || ''
            }), {
                app: this.app
            });
            done();
        }

        function submit(done) {
            this.user.registerWithFacebook(done);
        }

        function success() {
            this.appLogin(response, token);
        }

        function error(err) {
            console.log(err);
        }

        asynquence().or(error.bind(this))
            .then(prepare.bind(this))
            .then(submit.bind(this))
            .val(success.bind(this));
    },
    appLogin: function(response, token) {
        function prepare(done) {
            this.user = new User(_.extend({
                facebookId: response.id,
                facebookToken: token
            }), {
                app: this.app
            });
            done(); 
        }

        function submit(done) {
            this.user.authenticateWithFacebook(done);
        }

        function success() {
            var url = (this.redirectTo !== '') ? this.redirectTo : '/';

            this.app.trigger('login', this.user);
            this.app.trigger('loginSuccess');
            this.app.router.navigate(url, {
                trigger: true,
                replace: true
            });
        }

        function error(err) {
            if (err === 'Unauthorized') {
                this.register(response, token);
            }
        }

        asynquence().or(error.bind(this))
            .then(prepare.bind(this))
            .then(submit.bind(this))
            .val(success.bind(this));
    }
});
