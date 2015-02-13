'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('users/facebooklogin');
var _ = require('underscore');
var asynquence = require('asynquence');
var User = require('../../../../../../models/user');

module.exports = Base.extend({
    className: 'users_facebook_login',
    user: {},
    events: {
        'click [data-facebook-login]': 'facebookLogIn',
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
    },
    facebookLogIn: function() {
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
                this.appLogIn(response, token);
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
            this.appLogIn(response, token);
        }

        function error(err) {
            console.log(err);
        }

        asynquence().or(error.bind(this))
            .then(prepare.bind(this))
            .then(submit.bind(this))
            .val(success.bind(this));
    },
    appLogIn: function(response, token) {
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
            this.app.trigger('login', this.user);
            this.app.router.navigate('/', {
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
