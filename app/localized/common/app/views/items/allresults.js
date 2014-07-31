'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var querystring = require('querystring');
var asynquence = require('asynquence');
var helpers = require('../../../../../helpers');
var analytics = require('../../../../../analytics');

module.exports = Base.extend({
    className: 'items_allresults_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        _.each(data.items, this.processItem);
        return _.extend({}, data, {
            breadcrumb: helpers.breadcrumb.get.call(this, data)
        });
    },
    postRender: function() {
       var listingView = 'listView';

        if (typeof window !== 'undefined' && localStorage) {
            listingView = localStorage.getItem('listingView');
        }
        else {
            listingView = this.app.session.get('listingView');
        }
        if (listingView == 'galView') {
            switchView();
        }
        $('.switchView').click((function onClick(e) {
            switchView();
            var current = ($('.gallery-list').length === 0 ? 'listView' : 'galView');

            if (typeof window !== 'undefined' && localStorage) {
                localStorage.setItem('listingView', current);
            }
            else {
                this.app.session.persist({
                    listingView: current
                });
            }
        }).bind(this));

        function loadImages(url , $this) {
            var newImg = new Image();

            newImg.src = url;
            newImg.onload = function() {
                $this.css('background-image', 'url(' + url + ')');
            };
        }

        function switchView() {
            $('section#itemListing ul').toggleClass('gallery-list');
            $('.switchView').toggleClass('gallery');
            $('.filled').each(function() {
                var $this = $(this);

                loadImages($this.attr('data-fullimg') , $this);
            });
        }

        if (this.$('.is-loading').length) {
            this.attachInfiniteScroll(this.$('ul.itemListing'));
        }
    },
    processItem: function(item) {
        item.date.since = helpers.timeAgo(item.date);
    },
    attachInfiniteScroll: function(container) {
        var stop = false;
        var runnig = false;
        var loader = $('.is-loading');
        var search;
        var max;
        var view;
        var page;

        function checkLevel() {
            if (stop) {
                return this.undelegateEventScroll();
            }
            if (runnig) {
                return;
            }
            if (levelReached()) {
                runnig = true;
                loader.show();
                asynquence().or(finalize.bind(this))
                    .then(prepare.bind(this))
                    .then(findItems.bind(this))
                    .then(check.bind(this))
                    .then(track.bind(this))
                    .val(success.bind(this));
            }
        }

        function levelReached() {
            var pageHeight = Math.max(document.body.scrollHeight || document.body.offsetHeight);
            var viewportHeight = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0);
            var scrollHeight = (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0);

            return (pageHeight - viewportHeight - scrollHeight) < 50;
        }

        function preparePageParam(url) {
            if (page) {
                return ++page;
            }
            page = Number(url.replace(/.*-p-(\d+).*/, '$1'));
            page = (typeof page !== 'undefined' && (!isNaN(page) && page >= 1 && page <= 999999) ? page : 2);
            return page;
        }

        function prepareSearchParam(url) {
            if (search) {
                return search;
            }
            search = url.replace(/.*\/search\/(.+)\?.*/, '$1').replace(/\/$/, '');
            return search;
        }

        function prepare(done) {
            var urlFull = $('#currentUrl').val();
            var pairs = urlFull.split('?');
            var params;
            var url;

            pairs.shift();
            url = pairs.join('?');
            params = (url ? querystring.parse(url) : {});
            params.page = preparePageParam(urlFull);
            params.search = prepareSearchParam(urlFull);

            helpers.pagination.prepare(this.app, params);
            params.seo = true;
            params.languageId = this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id;
            delete params.search;
            delete params.page;
            delete params.filters;
            delete params.urlFilters;

            done(params);
        }

        function findItems(done, params) {
            max = params.pageSize;
            this.app.fetch({
                items: {
                    collection: 'Items',
                    params: params
                }
            }, {
                readFromCache: false
            }, done.errfcb);
        }

        function check(done, res) {
            if (!res.items || !res.items.length) {
                stop = true;
                loader.hide();
                return done.abort();
            }
            done(res.items.toJSON(), res.items.metadata);
        }

        function track(done, _items, metadata) {
            var img;
            var analyticImg;
            var urls;

            analytics.reset();
            analytics.setPage('nf');
            analytics.addParam('keyword', search);
            analytics.addParam('page_nb', Math.floor(metadata.total / max) + ((metadata.total % max) === 0 ? 0 : 1));

            urls = analytics.generateURL.call(this);
            if (!_.isArray(urls)) {
                urls = [urls];
            }

            _.each(urls, function(url) {
                img = $('<img/>');
                img.addClass('analytics');
                img.attr('src', url);
                analyticImg = $('.analytics:last');
                analyticImg.after(img);
            });

            done(_items);
        }

        function loadHTMLView(id) {
            if (view) {
                view.items = this.items;
                return $(view.getHtml());
            }
            var options = {
                context: this,
                app: this.app
            };
            var ViewClass;

            id = this.app.modelUtils.underscorize(id);
            ViewClass = Base.getView(this.app, id, this.app.options.entryPath);
            view = new ViewClass(options);
            return $(view.getHtml());
        }

        function success(_items) {
            var $html;

            _.each(_items, this.processItem);
            this.items = _items;
            $html = loadHTMLView.call(this, 'items/items');
            this.$('li:last', container).after($html.find('li'));
            finalize.call(this);
        }

        function finalize() {
            runnig = false;
            loader.hide();
        }

        $(window).on('scroll.infinite', checkLevel.bind(this));
        this.on('remove', this.undelegateEventScroll, this);
    },
    undelegateEventScroll: function() {
        $(window).off('scroll.infinite');
        return this;
    }
});

module.exports.id = 'items/allresults';