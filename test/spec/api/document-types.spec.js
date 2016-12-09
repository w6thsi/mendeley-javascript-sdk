'use strict';

var documentTypes = require('../../../lib/api/document-types');
var MIME_TYPES = require('../../../lib/mime-types');

// fixtures
var apiOptions = {
    baseUrl: 'https://api.mendeley.com',
    authFlow: function() {},
};

// test globals
var documentTypes;
var requestFunSpy;

// server/browser aware dependency injection helper
function getDocumentTypesProxy() {
    return (typeof window !=='undefined') ?
    require('proxy!../../../lib/api/document-types') :
    require('proxyquire').bind(null, '../../../lib/api/document-types');
}

describe('documentTypes api', function() {

    beforeAll(function() {
        requestFunSpy = jasmine.createSpy('requestFunSpy');
        var utilitiesMock = { requestFun: requestFunSpy };
        documentTypes = getDocumentTypesProxy()({ '../utilities': utilitiesMock });
    });

    describe('when initialised', function() {
        it('calls utilities.requestFun with constructor options', function() {
            documentTypes(apiOptions);
            expect(requestFunSpy).toHaveBeenCalledWith(
                jasmine.objectContaining(apiOptions)
            );
        });

        it('calls utilities.requestFun with correct request setup', function() {
            documentTypes(apiOptions);
            expect(requestFunSpy).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    method: 'GET',
                    resource: '/document_types',
                    headers: { 'Accept': MIME_TYPES.DOCUMENT_TYPE }
                })
            );
        });

        it('returns api object with retrieve property', function() {
            var documentTypesApiMethods = Object.keys(documentTypes(apiOptions));
            expect(documentTypesApiMethods).toContain('retrieve');
        });
    });

});
