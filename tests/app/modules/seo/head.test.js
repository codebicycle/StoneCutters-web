'use strict';
var title = "Bolivia ofrece anuncios clasificados locales para trabajos, compras, ventas, inmuebles, servicios, y eventos - Publica tu clasificado gratis - Bolivia ofrece anuncios clasificados locales para trabajos, compras, ventas, inmuebles, servicios, y eventos - Publica tu clasificado gratis";
var metas = { 
        description: 'Bolivia ofrece anuncios clasificados locales para trabajos, compras, ventas, inmuebles, servicios, y eventos - Publica tu clasificado gratis',
        topTitle: 'Bolivia ofrece anuncios clasificados locales para trabajos, compras, ventas, inmuebles, servicios, y eventos - Publica tu clasificado gratis',
        title: 'Bolivia ofrece anuncios clasificados locales para trabajos, compras, ventas, inmuebles, servicios, y eventos - Publica tu clasificado gratis',
        'google-site-verification': '_3dWQgd7S7XLeekqcv7n-A7exgaeZitXSo7mtI5K7ng',
        robots: 'index,follow',
        googlebot: 'index,follow',
        keywords: 'Bolivia, clasificados, anuncios clasificados, trabajos, en venta, inmuebles, servicios, eventos' 
    };
describe('app', function () {
    describe('modules', function () {
        describe('seo :: head', function () {
            beforeEach(reset);
            test();
        });
    });
});

function reset() {
   var options = {
        app: {
            session: {
                get: function location () {
                    return 'Bolivia';                    
                }
            }        
        }
    };        
    var Head = proxyquire(ROOT + '/app/modules/seo/models/head.js', {        
    });
    var head = new Head({}, options);

    head.setAll(metas,{});
  //  console.log(head.get('description'));
    
    
}
/*
  it('head metas should set on a head setters', function () {
        seo.head.set = sinon.stub();                
        seo.addMetatag('title','this a title of metatag');        
        expect(seo.head.set).calledOnce;
        expect(seo.head.set).calledWith('title','this a title of metatag');
    });
*/

function test() {

    it('true is true', function () {
    expect(true).to.be.true;
    });

}

