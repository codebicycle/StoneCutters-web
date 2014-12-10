'use strict';
//var item  = require('./features/item.js');
var generator;

describe('app', function () {
    describe('modules', function () {
        describe('seo', function () {
            describe('AltGenerator', function () {            
                beforeEach(reset);
                test();
            });
        });
    });
});

function reset() {
    var AltGenerator = proxyquire(ROOT + '/app/modules/seo/models/altGenerator.js', {        
    });
    var value;
    var options = {
        app: {
            session: {}
        },
        seo: {
        }
    };

    var item = {        
        price:
           { amount: 100000,
             displayPrice: 'Bs.100000',
             preCurrency: 'Bs.',
             postCurrency: ''
        },
        category: { name: 'Coches' },
        title: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit',
        description: 'Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus',
        location: {
            children: [{
                children: [
                    {   children: [ {  
                            name: "Neighborhood",
                            type: "neighborhood"
                        } ],                     
                        name: "City",
                        type: "city"                    
                    }
                  ],
                name: "State",
                type: "state",
            }],
            name: 'Country',
            type: 'country'
        },
        optionals: [
            {
                name: "model",
                label: "Modelo",
                id: "196",
                value: "Otro"
            },
            {
                name: "make",
                label: "Marca",
                id: "25",
                value: "Ford"
            },
            {
                name: "year",
                label: "Año",
                value: "2000"
            }
        ]
    };

    var levelPath = {                               
                "top": {
                    "categoryLevel": {
                        "noFollow": null,
                        "url": "http://tuscaloosa.olx.com/for-sale-cat-185",
                        "anchor": "1st level category"
                    },
                    "childCategoryLevel": {
                        "noFollow": null,
                        "url": "http://tuscaloosa.olx.com/animals-cat-312",
                        "anchor": "2nd level category"
                    }
                }};

    options.seo.get = sinon.stub();
    options.app.session.get = sinon.stub();  

    options.seo.get.withArgs('levelPath').returns(levelPath);
    generator = new AltGenerator(
        {
            item: item
        },
        {
            seo: options.seo,
            app: options.app
        }
    );
    
}
function test() {    
    it('AltGenerator should be an Array', function () {                        
       expect(generator.generate()).to.be.Array;       
    });
    it('AltGenerator should has neighborhood at 1 position', function () {                
       expect(generator.generate()[0].indexOf('- Neighborhood')).to.not.equal(-1);
    });
    it('AltGenerator should has the text \'Picture Of\' at 2 position', function () {                
       expect(generator.generate()[1].indexOf('Pictures of')).to.not.equal(-1);
    });
    it('AltGenerator should has \'City\' at 3 position', function () {                
       expect(generator.generate()[2].indexOf('City')).to.not.equal(-1);
    });
    it('AltGenerator should has \'2nd level category\' at 4 position', function () {                
       expect(generator.generate()[3].indexOf('2nd level category')).to.not.equal(-1);
    });
    it('AltGenerator should has \'1nd level category\' at 5 position', function () {                
       expect(generator.generate()[4].indexOf('1st level category')).to.not.equal(-1);
    });
    it('AltGenerator should has \'State\' at 6 position', function () {                
       expect(generator.generate()[5].indexOf('State')).to.not.equal(-1);
    });
    it('AltGenerator should has \'Country\' at 7 position', function () {                
       expect(generator.generate()[6].indexOf('Country')).to.not.equal(-1);
    });
    it('AltGenerator should has \'Brand\' at 8 position', function () {                
       expect(generator.generate()[7].indexOf('Ford Otro')).to.not.equal(-1);
    });
    it('AltGenerator should has \'Price\' at 9 position', function () {                
       expect(generator.generate()[8].indexOf('Bs.100000')).to.not.equal(-1);
    });
    it('AltGenerator should has first 50 chars at 10 position', function () {                
       expect(generator.generate()[9].indexOf('Lorem ipsum dolor sit amet')).to.not.equal(-1);
       expect(generator.generate()[9].length).to.be.equal(50);
    });

}
