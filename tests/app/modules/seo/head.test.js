'use strict';

var metas = {
        description: 'Bolivia ofrece anuncios clasificados locales para trabajos, compras, ventas, inmuebles, servicios, y eventos - Publica tu clasificado gratis',
        topTitle: 'Bolivia ofrece anuncios clasificados locales para trabajos, compras, ventas, inmuebles, servicios, y eventos - Publica tu clasificado gratis',
        title: 'Bolivia ofrece anuncios clasificados locales para trabajos, compras, ventas, inmuebles, servicios, y eventos - Publica tu clasificado gratis ESTO ES UN TITULO MUY EXTENSO Y TENDRIA QUE SER CORTADO',
        'google-site-verification': '_3dWQgd7S7XLeekqcv7n-A7exgaeZitXSo7mtI5K7ng',
        robots: 'index,follow',
        googlebot: 'index,follow',
        keywords: 'Bolivia, clasificados, anuncios clasificados, trabajos, en venta, inmuebles, servicios, eventos' 
    };
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

    var Head = proxyquire(ROOT + '/app/modules/seo/models/head.js', {        
    });
    var head = new Head({}, options);
    head.setAll(metas,{});    
    //head.set('title',metas);
    
}

function test() {
    /*it('true is true', function () {
    expect(true).to.be.true;
    });*/
}

