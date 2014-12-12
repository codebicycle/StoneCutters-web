'use strict';

var title = 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.';
var metas = {
    description: title,
    topTitle: title,
    title: title,
    'google-site-verification': '_3dWQgd7S7XLeekqcv7n-A7exgaeZitXSo7mtI5K7ng',
    robots: 'index,follow',
    googlebot: 'index,follow',
    keywords: 'Bolivia, clasificados, anuncios clasificados, trabajos, en venta, inmuebles, servicios, eventos'
};
var Head;

describe('app', function () {
    describe('modules', function () {
        describe('seo', function () {
            describe('head', function () {
                beforeEach(reset);
                test();
            });
        });
    });
});

function reset() {
    Head = proxyquire(ROOT + '/app/modules/seo/models/head.js', {});
}

function test() {
    it('true is true', function () {
        var options = {
            app: {
                session: {}
            }
        };
        options.app.session.get = sinon.stub();
        options.app.session.get.withArgs('location').returns({
            name: 'COUNTRY',
            url: 'www.domain.com'
        });
        var head = new Head({}, options);
        expect(head).to.be.an('object');
        head.setAll(metas, {});
        expect(true).to.be.true;
     });
}

