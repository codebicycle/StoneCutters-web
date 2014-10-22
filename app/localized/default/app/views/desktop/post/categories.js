'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var tracking = require('../../../../../../modules/tracking');
var _ = require('underscore');
var asynquence = require('asynquence');

module.exports = Base.extend({
    tagName: 'section',
    id: 'posting-categories-view',
    className: 'posting-categories-view wrapper',
    events: {
        'click .child-categories-list a': 'onSubCategoryClick'
    },

    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        return _.extend({}, data, {
            categories: this.parentView.options.categories.toJSON()
        });
    },
    onSubCategoryClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var id = $(event.currentTarget).data('id');

        var fetch = function(done) {
            $('body > .loading').show();
            this.app.fetch({
                fields: {
                    model: 'Field',
                    params: {
                        intent: 'post',
                        location: this.app.session.get('siteLocation'),
                        categoryId: id,
                        languageId: this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id
                        //spike: true
                    }
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }.bind(this);

        var error = function(err) {
            console.log(err); // TODO: HANDLE ERRORS
        }.bind(this);

        var track = function(done, res) {
            var img;
            var analyticImg;
            var trackingInfo;

            tracking.reset();
            tracking.setPage('post#subcat');

            trackingInfo = tracking.generateURL.call(this);
            _.each(trackingInfo.urls, function(url) {
                img = $('<img/>');
                img.addClass('analytics');
                img.attr('src', url);
                analyticImg = $('.analytics:last');
                analyticImg.after(img);
            });

            _gaq.push(function() {
                var host = trackingInfo.params.google.host;
                var tracker = window._gat._getTracker(trackingInfo.params.google.id);
                var referrerDomain = 'emptyReferrer';
                var doStore = true;

                if (typeof document.referrer !== 'undefined' && document.referrer !== '') {
                    referrerDomain = document.referrer.match(/:\/\/(.[^/]+)/)[1];

                    if (referrerDomain.indexOf(host) != -1) {
                        doStore = false;
                    }
                }
                if (doStore) {
                    tracker._setCustomVar(2, 'keep_referral', referrerDomain, 2);
                }
                tracker._set("title",trackingInfo.params.keyword);
                tracker._trackPageview(trackingInfo.params.page);
            });

            window.atiapi.push({
                xtdmc: trackingInfo.params.ati.host,
                xtnv: document,
                xtsd: trackingInfo.params.ati.protocol + '://' + trackingInfo.params.ati.logServer,
                xtsite: trackingInfo.params.ati.siteId,
                xtcustom: JSON.parse(trackingInfo.params.custom),
                xtergo: '1'
            });

            done(res);
        }.bind(this);

        var success = function(res) {
            var fields = res.fields.get('fields');

            if (fields) {
                $('#posting-optionals-view').trigger('update', [fields.categoryAttributes]);
                $('#posting-contact-view').trigger('update', [fields.contactInformation]);
            }
        }.bind(this);

        asynquence().or(error)
            .then(fetch)
            .then(track)
            .val(success);
    }
});

module.exports.id = 'post/categories';
