'use strict';

var utilitiesMock = require('../../mocks/utilities');
var apiOptions = require('../../mocks/apiOptions');
var MIME_TYPES = require('../../../lib/mime-types');

// test globals
var documentTypes;

// server/browser aware dependency injection helper
function getDocumentTypesProxy() {
    return (typeof window !=='undefined') ?
    require('proxy!../../../lib/api/document-types') :
    require('proxyquire').bind(null, '../../../lib/api/document-types');
}

describe('documentTypes api', function() {

    beforeAll(function() {
        spyOn(utilitiesMock, 'requestFun').and.callThrough();
        documentTypes = getDocumentTypesProxy()({ '../utilities': utilitiesMock });
    });
    afterEach(function() { utilitiesMock.requestFun.calls.reset(); });

    describe('when initialised', function() {
        it('calls utilities.requestFun with constructor options', function() {
            documentTypes(apiOptions);
            expect(utilitiesMock.requestFun).toHaveBeenCalledWith(
                jasmine.objectContaining(apiOptions)
            );
        });

        it('calls utilities.requestFun with correct request setup', function() {
            documentTypes(apiOptions);
            expect(utilitiesMock.requestFun).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    method: 'GET',
                    resource: '/document_types',
                    headers: { 'Accept': MIME_TYPES.DOCUMENT_TYPE }
                })
            );
        });

        it('returns api object with "retrieve" property containing the request function', function() {
            var documentTypesApi = documentTypes(apiOptions);
            expect(documentTypesApi.retrieve).toEqual(utilitiesMock.requestFun());
        });
    });

});
