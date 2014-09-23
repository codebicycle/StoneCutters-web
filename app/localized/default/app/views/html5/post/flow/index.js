'use strict';

var Base = require('../../../../../../common/app/bases/view').requireView('post/flow/index');
var helpers = require('../../../../../../../helpers');
var asynquence = require('asynquence');
var _ = require('underscore');
var translations = require('../../../../../../../../shared/translations');
window.URL = window.URL || window.webkitURL;

module.exports = Base.extend({
    form: {},
    errors: {},
    initialize: function() {
        Base.prototype.initialize.call(this);
        this.form = {};
        this.errors = {};
        this.currentViewName = 'hub';
        this.dictionary = translations[this.app.session.get('selectedLanguage') || 'en-US'] || translations['es-ES'];
    },
    postRender: function() {
        $(window).on('beforeunload', this.onBeforeUnload);
        $(window).on('unload', {
            async: false
        }, this.onExit.bind(this));
        this.app.router.once('action:end', this.onStart);
        this.app.router.once('action:start', this.onEnd);
        this.attachTrackMe(this.className, function(category, action) {
            return {
                custom: [category, this.form['category.parentId'] || '-', this.form['category.id'] || '-', action].join('::')
            };
        }.bind(this));
    },
    onBeforeUnload: function(event) {
        return ' ';
    },
    onStart: function(event) {
        this.appView.trigger('postingflow:start');
    },
    onEnd: function(event) {
        $(window).off('beforeunload', this.onBeforeUnload);
        this.currentView.$el.trigger('exit');
        this.appView.trigger('postingflow:end');
    },
    events: {
        'flow': 'onFlow',
        'headerChange': 'onHeaderChange',
        'stepChange': 'onStepChange',
        'categorySubmit': 'onCategorySubmit',
        'subcategorySubmit': 'onSubcategorySubmit',
        'optionalsSubmit': 'onOptionalsSubmit',
        'descriptionSubmit': 'onDescriptionSubmit',
        'contactSubmit': 'onContactSubmit',
        'locationSubmit': 'onLocationSubmit',
        'submit': 'onSubmit',
        'restart': 'onRestart',
        'trackEventNext': 'onNext',
        'exit': 'onExit',
        'imagesLoadStart': 'onImagesLoadStart',
        'imagesLoadEnd': 'onImagesLoadEnd',
        'categoryReset': 'onCategoryReset',
        'errors': 'onErrors'
    },
    onFlow: function(event, from, to, data) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.currentViewName = (to || 'hub');
        this.$('#' + this.currentViewName).trigger('show', data || {});
        this.$('#' + from).trigger('hide', data || {});
        this.$el.scrollTop();
        if (!this.edited) {
            this.handleBack();
        }
    },
    handleBack: function() {
        var popText = this.dictionary['misc.WantToGoBack'];

        this.edited = true;
        history.pushState(null, '', window.location.pathname);
        $(window).on('popstate', onpopstate);

        function onpopstate(event) {
            if (confirm(popText)) { // Now find a better translation
                $(window).off('popstate', onpopstate);
                history.back();
            }
            else {
                history.pushState(null, '', window.location.pathname);
            }
        }
    },
    onHeaderChange: function(event, title, current, back, data) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$('header').trigger('change', [title, current, back || 'hub', data]);
    },
    onStepChange: function(event, before, after) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$('#hub').trigger('stepChange', [before, after]);
    },
    onCategorySubmit: function(event, category, error, subError) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (this.form['category.parentId'] !== category.id) {
            delete this.form['category.id'];
        }
        this.form['category.parentId'] = category.id;
        this.errors['category.parentId'] = error;
        this.errors['category.id'] = subError;
        this.$('#hub').trigger('categoryChange', [this.form['category.parentId'], this.form['category.id'], this.errors['category.parentId'], this.errors['category.id']]);
    },
    onSubcategorySubmit: function(event, subcategory, error) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.form['category.id'] = subcategory.id;
        this.errors['category.id'] = error;
        this.$('#hub').trigger('categoryChange', [this.form['category.parentId'], this.form['category.id'], this.errors['category.parentId'], this.errors['category.id']]);
        if (subcategory.fields) {
            this.$('#optionals').trigger('fieldsChange', [subcategory.fields.get('fields').categoryAttributes, this.form['category.parentId'], this.form['category.id'], true]);
            this.$('#description').trigger('fieldsChange', [subcategory.fields.get('fields').productDescription]);
            this.$('#contact').trigger('fieldsChange', [subcategory.fields.get('fields').contactInformation]);
        }
    },
    onOptionalsSubmit: function(event, fields, errors) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        fields.forEach(function each(field) {
            if (field.value) {
                this.form[field.name] = field.value;
            }
            else {
                delete this.form[field.name];
            }
        }.bind(this));
    },
    onDescriptionSubmit: function(event, fields, errors) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        fields.forEach(function each(field) {
            if (field.value) {
                this.form[field.name] = field.value;
            }
            else {
                delete this.form[field.name];
            }
        }.bind(this));
        this.$('#hub').trigger('descriptionChange', [fields, errors]);
        this.$el.trigger('trackEventNext', ['ClickDescribeAdNext']);
    },
    onContactSubmit: function(event, fields, city, errors, cityError) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        fields.forEach(function each(field) {
            if (field.value) {
                this.form[field.name] = field.value;
            }
            else {
                delete this.form[field.name];
            }
        }.bind(this));
        this.form.location = city.url;
        this.$('#hub').trigger('contactChange', [fields, city, errors, cityError]);
        this.$el.trigger('trackEventNext', ['ClickContactInfoNext']);
    },
    onLocationSubmit: function(event, city, error) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$('#contact').trigger('locationChange', [city, error]);
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
            function callback(err, response, body) {
                if (err) {
                    return done.fail(err);
                }
                if (body) {
                    done.abort();
                    return fail(body, 'invalid');
                }
                done(response, body);
            }
            
            query.intent = 'validate';
            helpers.dataAdapter.post(this.app.req, '/items', {
                query: query,
                data: this.form
            }, done.errfcb);
        }.bind(this);

        var post = function(done, response) {
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
    },
    onRestart: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.form = {};
        this.errors = {};
        this.childViews.forEach(function each(view) {
            view.$el.trigger('restart');
        });
    },
    onNext: function(event, action) {
        var category = 'Posting';

        this.track({
            category: category,
            action: action,
            custom: [category, this.form['category.parentId'] || '-', this.form['category.id'] || '-', action].join('::')
        });
    },
    onExit: function(event) {
        var category = 'Posting';
        var action = 'DropSection';
        var images = this.form.images;
        var status = [];

        status.push('section:' + this.currentViewName);
        status.push('category:' + (this.form['category.parentId'] ? 1 : 0));
        status.push('subcategory:' + (this.form['category.id'] ? 1 : 0));
        status.push('title:' + (this.form.title ? 1 : 0));
        status.push('description:' + (this.form.description ? 1 : 0));
        status.push('email:' + (this.form.email ? 1 : 0));
        status.push('state:' + (this.form.location ? 1 : 0));
        status.push('city:' + (this.form.location ? 1 : 0));
        status.push('pictures:' + (images ? (_.isString(images) ? images.split(',') : images).length : 0));

        this.track({
            category: category,
            action: action,
            custom: [category, this.form['category.parentId'] || '-', this.form['category.id'] || '-', action].concat(status).join('::')
        }, {
            async: (event.data && !_.isUndefined(event.data.async) ? event.data.async : true)
        });
    },
    onImagesLoadStart: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$('#hub').trigger('imagesLoadStart');
    },
    onImagesLoadEnd: function(event, images) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var ids = [];
        var files = [];
        var orientations = [];

        Object.keys(images).sort().forEach(function each(image) {
            ids.push(images[image].id);
            files.push(images[image].file);
            orientations.push(images[image].orientation);
        });
        if (ids.length) {
            this.form._images = ids;
        }
        else {
            delete this.form._images;
            delete this.form.images;
        }
        this.$('#hub').trigger('imagesLoadEnd', [files.shift(), orientations.shift()]);
    },
    onCategoryReset: function(event) {
        this.$el.trigger('stepChange', ['optionals', 'categories']);
        this.$('#subcategories').trigger('restart');
        this.$('#optionals').trigger('restart');
    },
    onErrors: function(event, errors) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$('#errors').trigger('show', [errors]);
    }
});
