'use strict';

var esi;

describe('app', function() {
    describe('modules', function() {
        describe('esi', function() {
            beforeEach(reset);
            test();
        });
    });
});

function reset() {
    esi = proxyquire(ROOT + '/app/modules/esi', {});
}

function test() {
    it('should be a method', function() {
        expect(esi.isEnabled).to.be.instanceOf(Function);
        expect(esi.isEsiString).to.be.instanceOf(Function);
        expect(esi.generateVar).to.be.instanceOf(Function);
        expect(esi.esify).to.be.instanceOf(Function);
    });

    // it('should be disabled', function() {
    //     expect(esi.isEnabled()).to.be.false;
    // });

    // it('should be false', function() {
    //     expect(esi.isEsiString('abcd1234')).to.be.not.ok;
    // });

    // it('should be true', function() {
    //     expect(esi.isEsiString('<esi:vars>abcd1234</esi:vars>')).to.be.ok;
    // });

    // it('should be an esi string', function() {
    //     var clientId = esi.generateVar('abcd1234');

    //     expect(esi.isEsiString(clientId)).to.be.true;
    // });

    // it('should not be an esi string', function() {
    //     var clientId = esi.generateVar('abcd1234');

    //     expect(esi.isEsiString(clientId)).to.be.true;
    // });

    // it('should be a equal strings', function() {
    //     var clientId = 'abcd1234';

    //     expect(esi.esify(clientId, clientId)).to.equal(clientId);
    // });
}
