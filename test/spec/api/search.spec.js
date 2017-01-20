'use strict';

var utilitiesMock = require('../../mocks/utilities');
var apiOptions = require('../../mocks/apiOptions');
var MIME_TYPES = require('../../../lib/mime-types');

// test globals
var search;

// server/browser aware dependency injection helper
function getSearchProxy() {
    return (typeof window !=='undefined') ?
    require('proxy!../../../lib/api/search') :
    require('proxyquire').bind(null, '../../../lib/api/search');
}

describe('search api', function() {

    beforeAll(function() {
        spyOn(utilitiesMock, 'requestFun').and.callThrough();
        search = getSearchProxy()({ '../utilities': utilitiesMock });
    });
    afterEach(function() { utilitiesMock.requestFun.calls.reset(); });

    describe('when initialised', function() {
        it('calls utilities.requestFun with constructor options', function() {
            search(apiOptions);
            expect(utilitiesMock.requestFun).toHaveBeenCalledWith(
                jasmine.objectContaining(apiOptions)
            );
        });

        it('calls utilities.requestFun with correct request setup', function() {
            search(apiOptions);
            expect(utilitiesMock.requestFun).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    method: 'GET',
                    resource: '/search/catalog',
                    headers: { 'Accept': MIME_TYPES.DOCUMENT }
                })
            );
        });

        it('returns api object with "catalog" property containing the request function', function() {
            var searchApi = search(apiOptions);
            expect(searchApi.catalog).toEqual(utilitiesMock.requestFun());
        });
    });

});
