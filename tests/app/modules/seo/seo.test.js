'use strict';

var item = require('./features/item.js');
var meta = require('./features/metas.js');
var itemImage;
var config;
var seo;
var Seo;

describe('app', function () {
    describe('modules', function () {
        describe('seo', function () {
            beforeEach(reset);
            test();
        });
    });
});

function reset() {
    var options = {
        app: {
            session: {}
        }
    };
    options.app.session.get = sinon.stub();
    options.app.session.get.withArgs('location').returns({
        name: 'Bolivia',
        url: 'www.olx.com.bo'
    });

    config = {};
    mockConfig();
    Seo = proxyquire(ROOT + '/app/modules/seo', {
        '../../../shared/config': config
    });
    seo = new Seo({}, options);

}

function test() {

    it('seo module should be enabled', function () {
        expect(Seo.isEnabled()).to.be.true;
    });

    it('content should be set', function () {
        expect(seo.get('popularSearches')).to.be.undefined;
        seo.setContent(meta);
        expect(seo.get('popularSearches')).not.to.be.undefined;
        expect(seo.get('topSearches')).not.to.be.undefined;
    });

    it('on set altImages should call to onChangeAltImages', function () {
        seo.onChangeAltImages = sinon.stub();
        seo.set('altImages', item);
        expect(seo.onChangeAltImages).calledOnce;
        expect(seo.onChangeAltImages).calledWith(seo, item);
    });

    it('head metas should set on a head setters', function () {
        seo.head.set = sinon.stub();
        seo.addMetatag('title', 'this a title of metatag');
        expect(seo.head.set).calledOnce;
        expect(seo.head.set).calledWith('title', 'this a title of metatag');
    });
}

function mockConfig() {
    var values = {
        seo: {
            enabled: true,
            levelPath: true,
            popularSearches: true,
            topSearches: true,
            relatedListings: true,
            topTitle: true,
            references: true,
            wikititles: true,
            prevItem: true,
            nextItem: true,
            metaTitleLength: 110,
            metaDescriptionLength: 160,
            maxResultToIndexFollow: 0
        }
    };
    config.get = sinon.stub();
    config.get.returns(values);

    config.getForMarket = sinon.stub();
    config.getForMarket.returns(values.seo.enabled);
}


