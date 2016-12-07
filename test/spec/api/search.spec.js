'use strict';

var search = require('../../../lib/api/search');
var MIME_TYPES = require('../../../lib/mime-types');

// fixtures
var apiOptions = {
    baseUrl: 'https://api.mendeley.com',
    authFlow: function() {},
};

// test globals
var search;
var requestFunSpy;

// server/browser aware dependency injection helper
function getSearchProxy() {
    return (typeof window !=='undefined') ?
    require('proxy!../../../lib/api/search') :
    require('proxyquire').bind(null, '../../../lib/api/search');
}

describe('search api', function() {

    beforeAll(function() {
        requestFunSpy = jasmine.createSpy('requestFunSpy');
        var utilitiesMock = { requestFun: requestFunSpy };
        search = getSearchProxy()({ '../utilities': utilitiesMock });
    });

    describe('when initialised', function() {
        it('calls utilities.requestFun with constructor options', function() {
            search(apiOptions);
            expect(requestFunSpy).toHaveBeenCalledWith(
                jasmine.objectContaining(apiOptions)
            );
        });

        it('calls utilities.requestFun with correct request setup', function() {
            search(apiOptions);
            expect(requestFunSpy).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    method: 'GET',
                    resource: '/search/catalog',
                    headers: { 'Accept': MIME_TYPES.DOCUMENT }
                })
            );
        });

        it('returns api object with catalog search property', function() {
            var searchApiMethods = Object.keys(search(apiOptions));
            expect(searchApiMethods).toContain('catalog');
        });
    });

});
