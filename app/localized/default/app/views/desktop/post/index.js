'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');
var asynquence = require('asynquence');

module.exports = Base.extend({
    tagName: 'main',
    id: 'posting-view',
    className: 'posting-view',
    form: {},
    events: {
        'focus .text-field': 'active',
        'blur .text-field': 'active',
        'subcategorySubmit': 'onSubcategorySubmit',
        'fieldSubmit': 'onFieldSubmit',
        'imagesLoadEnd': 'onImagesLoadEnd',
        'submit': 'onSubmit'
    },
    initialize: function() {
        Base.prototype.initialize.call(this);
        this.form = {};
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data);
    },
    active: function(event) {
        $(event.currentTarget).closest('.wrapper').toggleClass('input-focus');
    },
    onSubcategorySubmit: function(event, subcategory) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (this.form['category.id'] === subcategory.id) {
            return;
        }
        this.form['category.parentId'] = subcategory.parentId;
        this.form['category.id'] = subcategory.id;
        this.$('#posting-optionals-view').trigger('fieldsChange', [subcategory.fields.categoryAttributes, subcategory.parentId, subcategory.id, true]);
    },
    onFieldSubmit: function(event, field) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (field.value) {
            this.form[field.name] = field.value;
        }
        else {
            delete this.form[field.name];
        }
    },
    onImagesLoadEnd: function(event, images) {
        this.form._images = Object.keys(images).map(function each(image) {
            return images[image].id;
        });
    },
    onSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $loading = $('body > .loading').show();
        var query = {
            postingSession: this.options.postingsession
        };
        var user = this.app.session.get('user');

        var validate = function(done) {
            function callback(body, status, response) {
                if (status !== 'success') {
                    return done.fail(body);
                }
                if (body) {
                    done.abort();
                    return fail(body, 'invalid');
                }
                done();
            }

            query.intent = 'validate';
            helpers.dataAdapter.post(this.app.req, '/items', {
                query: query,
                data: this.form
            }, callback);
        }.bind(this);

        var post = function(done) {
            query.intent = 'create';
            helpers.dataAdapter.post(this.app.req, '/items', {
                query: query,
                data: this.form,
                done: done,
                fail: done.fail
            });
        }.bind(this);

        var fail = function(err, track) {
            // TODO: Improve error handling
            always();
            if (err) {
                if (err.responseText) {
                    err = JSON.parse(err.responseText);
                }
                if (_.isArray(err)) {
                    this.$el.trigger('errors', [err]);
                }
            }
            trackFail(track);
        }.bind(this);

        var trackFail = function() {
            var url = helpers.common.fullizeUrl('/analytics/graphite.gif', this.app);

            $.ajax({
                url: helpers.common.link(url, this.app, {
                    metric: 'post,error',
                    location: this.app.session.get('location').name,
                    error: track || 'error'
                }),
                cache: false
            });
        }.bind(this);

        var success = function(item) {
            var category = 'Posting';
            var action = 'PostingSuccess';

            this.track({
                category: category,
                action: action,
                custom: [category, this.form['category.parentId'] || '-', this.form['category.id'] || '-', action, item.id].join('::')
            });
            this.app.router.once('action:end', always);
            helpers.common.redirect.call(this.app.router, '/posting/success/' + item.id + '?sk=' + item.securityKey, null, {
                status: 200
            });
            track();
        }.bind(this);

        var track = function() {
            var url = helpers.common.fullizeUrl('/analytics/graphite.gif', this.app);

            $.ajax({
                url: helpers.common.link(url, this.app, {
                    metric: 'post,success',
                    location: this.app.session.get('location').name
                }),
                cache: false
            });
        }.bind(this);

        var always = function() {
            $loading.hide();
        }.bind(this);

        this.$('#errors').trigger('hide');

        if (user) {
            query.token = user.token;
        }
        this.form.languageId = this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id;
        this.form.platform = this.app.session.get('platform');
        this.form.ipAddress = this.app.session.get('ip');
        if (this.form._images) {
            this.form.images = this.form._images.join(',');
        }
        asynquence().or(fail)
            .then(validate)
            .then(post)
            .val(success);
    }
});

module.exports.id = 'post/index';
