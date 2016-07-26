/* jshint sub: true */
'use strict';

describe('api endpoints', function() {

    var api = require('../../').API;

    it('are able to clone their instances', function() {
        Object.keys(api).map(function(endpointName) {
            return api[endpointName];
        }).filter(function(endpointObject) {
            // we only test enpoint objects (we skip the functions on api object)
            typeof endpointObject === 'object';
        }).forEach(function(endpointObject) {
            expect(typeof endpointObject.for).toBe('function');
        });
    });

    describe('cloned instances', function() {

        it('are stored for reuse and mapped by string keys', function() {
            var foldersApi = api.folders.for('my_documents');
            expect(api.folders.for('my_documents')).toBe(foldersApi);
        });

        it('have identical interface', function() {
            var foldersApi = api.folders.for('my_documents');
            var groupFoldersApi = api.folders.for('some_group_id');

            Object.keys(foldersApi).forEach(function(key) {
                expect(typeof foldersApi[key]).toBe(typeof groupFoldersApi[key]);
            });
        });

        it('are unique for each key', function() {
            var foldersApi = api.folders.for('my_documents');
            var groupFoldersApi = api.folders.for('some_group_id');

            expect(foldersApi).not.toBe(groupFoldersApi);
            expect(foldersApi.paginationLinks).not.toBe(groupFoldersApi.paginationLinks);
        });

    });

    describe('multiple instances', function() {
      var sdk = require('../../');

      it('should remove the global api when using instances', function() {
          var api = sdk({})

          expect(api.API).toBeUndefined();
      });

      it('should turn baseUrl and authFlow into functions', function() {
          var baseUrl = 'baseUrl';
          var authFlow = 'authFlow';
          var options = {
            baseUrl: baseUrl,
            authFlow: authFlow
          }
          var api = sdk(options)

          expect(options.baseUrl).toEqual(jasmine.any(Function));
          expect(options.baseUrl()).toEqual(baseUrl);
          expect(options.authFlow).toEqual(jasmine.any(Function));
          expect(options.authFlow()).toEqual(authFlow);
      });

      it('should respect baseUrl and authFlow as functions', function() {
          var baseUrl = 'baseUrl';
          var baseUrlFunc = function () {
            return baseUrl;
          };
          var authFlow = 'authFlow';
          var authFlowFunc = function () {
            return authFlow;
          };
          var options = {
            baseUrl: baseUrlFunc,
            authFlow: authFlowFunc
          }
          var api = sdk(options)

          expect(options.baseUrl).toEqual(baseUrlFunc);
          expect(options.baseUrl()).toEqual(baseUrl);
          expect(options.authFlow).toEqual(authFlowFunc);
          expect(options.authFlow()).toEqual(authFlow);
      });

      it('should explode if passed no options', function() {
          expect(function () {
            sdk();
          }).toThrow();
      });

      it('should allow two sets of authFlow credentials', function() {
          var options1 = {
            authFlow: 'authFlow1'
          }
          var options2 = {
            authFlow: 'authFlow2'
          }

          var api1 = sdk(options1)
          var api2 = sdk(options2)

          expect(options1.authFlow()).toEqual('authFlow1');
          expect(options2.authFlow()).toEqual('authFlow2');
      });
    })

});
/* jshint sub: false */
