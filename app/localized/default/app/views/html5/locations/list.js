'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var Base = require('../../../../../common/app/bases/view').requireView('locations/list');
var helpers = require('../../../../../../helpers');
var utils = require('../../../../../../../shared/utils');

module.exports = Base.extend({
    latitude: '',
    longitude: '',
    showAutoLocation: false,
    getTemplateData: function(){
        var data = Base.prototype.getTemplateData.call(this);
        var citiesNames = [];
        if (data.search) {
            _.each(_.groupBy(_.pluck(data.cities, 'name')), function(val, key){
                if (val.length > 1) {
                    citiesNames.push(key);
                }
            });
            _.each(data.cities, function(obj){
                _.find(citiesNames, function(val){
                    if (obj.name === val) {
                        obj.repeat = true;
                        return obj;
                    }
                });
            });
        }
        if (data.target) {
            data.target = data.target.replace(/(-neighborhood)([0-9_]+)/, '');
        }
        return _.extend({}, data, {});
    },
    postRender: function() {
        var callback;
        var errorCallback;

        this.attachTrackMe();

        this.$('#location .country-link, .cities-links .city-link').on('click', function(e) {
            var href = $(e.currentTarget).attr('href');
            var siteLocation = utils.params(href, 'location');

            $('body').trigger('change:location', siteLocation);
        }.bind(this));

        this.app.router.once('action:start', this.onStart);
        this.app.router.once('action:end', this.onEnd);
        this.app.on('change:autolocation', this.autolocation, this);
        if (this.app.get('autolocation')) {
            this.autolocation();
        }
    },
    autolocation: function() {
        var autolocation = this.app.get('autolocation');

        if (!autolocation) {
            this.$('#autolocation').hide();
            return;
        }
        this.latitude = autolocation.coords.latitude;
        this.longitude = autolocation.coords.longitude;
        this.$('#autolocation').show();
    },
    events: {
        'submit': 'onSubmit',
        'click a[data-location]': 'onClickLocation',
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
    onClickLocation: function(event) {
        this.app.session.persist({
            siteLocation: $(event.currentTarget).data('location')
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
            var params;
            var location = this.app.session.get('location').url;

            if (res.children) {
                if (res.children[0].children) {
                    url = res.children[0].children[0].url;
                }
                else {
                    url = res.children[0].url;
                }
            }
            else {
                url = res.url;
            }

            if (url !== '') {
                params = {
                    location: url
                };
            }
            if (location == res.url) {
                helpers.common.redirect.call(this.app.router || this, '/', params, {
                        status: 200
                    }
                );
            }

        }.bind(this);

        var error = function(err) {
            //console.log('Autolocation :: Error');
        }.bind(this);

        asynquence().or(error)
            .then(autolocation)
            .val(success);
    }
});

