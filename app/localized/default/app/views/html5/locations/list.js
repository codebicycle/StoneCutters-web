'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('locations/list');
var helpers = require('../../../../../../helpers');
var asynquence = require('asynquence');
var _ = require('underscore');

module.exports = Base.extend({
    latitude: '',
    longitude: '',
    showAutoLocation: false,
    postRender: function() {
        var callback;
        var errorCallback;

        this.app.router.once('action:start', this.onStart);
        this.app.router.once('action:end', this.onEnd);

        if (helpers.features.isEnabled.call(this, 'autoLocation')) {
            if (navigator.geolocation) {
                callback = function (position) {
                        this.latitude = position.coords.latitude;
                        this.longitude = position.coords.longitude;
                        this.$('#autolocation').show();
                        this.showAutoLocation = true;
                    }.bind(this);
                errorCallback = function (error) {
                        this.showAutoLocation = false;
                    }.bind(this);

                navigator.geolocation.getCurrentPosition(callback, errorCallback, {
                        maximumAge: 0,
                        timeout: 6000
                    });
            }
        }
    },
    events: {
        'submit': 'onSubmit',
        'click #autolocation': 'onAutoLocation'
    },
    onStart: function(event) {
        this.appView.trigger('location:end');
    },
    onEnd: function(event) {
        this.appView.trigger('location:start');
    },
    onSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var url = '/location?search=' + (this.$('form input[name=search]').val() || '');

        if (this.options.target) {
            url += '&target=' + this.options.target;
        }

        helpers.common.redirect.call(this.app.router, url, null, {
            status: 200
        });
    },
    onAutoLocation: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var autolocation = function(done) {
            helpers.dataAdapter.get(this.app.req, '/locations', {
                query: {
                    latitude: this.latitude,
                    longitude: this.longitude
                },
                done: done,
                fail: done.fail
            }, done.errfcb);
        }.bind(this);

        var success = function(res, body) {
            var url;

            if (body.children) {
                url = body.children[0].url;
            }
            else {
                url = body.url;
            }

            helpers.common.redirect.call(this.app.router || this, '/', {
                    location: url
                }, {
                    status: 200
                }
            );

        }.bind(this);

        var error = function(err) {
            //console.log('Autolocation :: Error');
        }.bind(this);

        asynquence().or(error)
            .then(autolocation)
            .val(success);
    }
});

