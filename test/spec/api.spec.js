/* jshint sub: true */
'use strict';

require('es5-shim');

describe('api endpoints', function() {

    var api = require('api');

    it('are able to clone their instances', function () {
        Object.keys(api).map(function (endpointName) {
            return api[endpointName];
        }).filter(function (endpointObject) {
            // we only test enpoint objects (we skip the functions on api object)
            typeof endpointObject === 'object';
        }).forEach(function (endpointObject) {
            expect(typeof endpointObject.for).toBe('function');
        });
    });

    describe('cloned instances', function () {

        it('are stored for reuse and mapped by string keys', function () {
            var foldersApi = api.folders.for('my_documents');
            expect(api.folders.for('my_documents')).toBe(foldersApi);
        });

        it('have identical interface', function () {
            var foldersApi = api.folders.for('my_documents');
            var groupFoldersApi = api.folders.for('some_group_id');

            Object.keys(foldersApi).forEach(function (key) {
                expect(typeof foldersApi[key]).toBe(typeof groupFoldersApi[key]);
            });
        });

        it('are unique for each key', function () {
            var foldersApi = api.folders.for('my_documents');
            var groupFoldersApi = api.folders.for('some_group_id');

            expect(foldersApi).not.toBe(groupFoldersApi);
            expect(foldersApi.paginationLinks).not.toBe(groupFoldersApi.paginationLinks);
        });

    });

});
/* jshint sub: false */
