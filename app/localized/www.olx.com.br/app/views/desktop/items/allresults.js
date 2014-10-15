var Base = require('../../../../../common/app/bases/view').requireView('items/allresults');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');
var Seo = require('../../../../../../modules/seo');
var asynquence = require('asynquence');

module.exports = Base.extend({
    className: 'items_allresults_view',
    
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
        $('.switchView').click((function(e) {
            switchView();
            var current = ($('.gallery-list').length === 0 ? 'listView' : 'galView');
            if (typeof window !== 'undefined' && localStorage) {
                localStorage.setItem('listingView', current);
            }else{
                this.app.session.persist({
                    listingView: current
                });
            }
        }).bind(this));

        function loadImages(url , $this) {
            var newImg = new Image();

            newImg.src = url;
            newImg.onload = function() {
                $this.css('background-image', 'url('+url+')');
            };
        }

        function switchView() {
            $('section#itemListing ul').toggleClass('gallery-list');
            $('.switchView').toggleClass('gallery');
            $('.filled').each(function() {
                var $this = $(this);

                loadImages($this.attr('data-fullimg'), $this);
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
        var catId;
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
                    //.then(track.bind(this))
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

        function prepareCategoryParam(url) {
            if (catId) {
                return catId;
            }
            catId = url.replace(/.*-cat-(\d+).*/, '$1');
            return catId;
        }

        function prepare(done) {
            var seo = Seo.instance(this.app);
            var urlFull = $('#currentUrl').val();
            var pairs = urlFull.split('?');
            var params;
            var url;

            pairs.shift();
            url = pairs.join('?');
            params = (url ? querystring.parse(url) : {});
            params.page = preparePageParam(urlFull);
            params.catId = prepareCategoryParam(urlFull);

            helpers.pagination.prepare(this.app, params);
            params.categoryId = params.catId;
            params.seo = seo.isEnabled();
            params.languageId = this.app.session.get('languages')._byId[this.app.session.get('selectedLanguage')].id;
            delete params.catId;
            delete params.title;
            delete params.page;
            delete params.filters;
            delete params.urlFilters;

            done(params);
        }

        function findItems(done, params) {
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
            done(res.items.toJSON());
        }

        function buildCategory(id) {
            var category = $(id).val();

            category = category.split(',');
            return {
                id: category.shift(),
                name: category.join(',')
            };
        }

        function track(done, _items) {
            var category = buildCategory('#category');
            var subcategory = buildCategory('#subcategory');
            var img;
            var analyticImg;
            var analyticInfo;

            tracking.reset();
            tracking.setPage('listing');
            tracking.addParam('category', category);
            tracking.addParam('subcategory', subcategory);

            analyticInfo = tracking.generateURL.call(this);
            _.each(analyticInfo.urls, function(url) {
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
            $('li:last', container).after($html.find('li'));
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
