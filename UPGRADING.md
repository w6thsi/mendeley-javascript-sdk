Upgrading to v3.x
=================

This version introduces some breaking changes that will effect client applications. These six breaking changes are approximately in order of impact.

1.  All SDK methods now return Bluebird promises instead of jQuery promises. It is therefore no longer possible to assign handlers with .done(), .fail(),
or .always() - you must use .then(), .catch(), and .finally()

  Because promises do not support progress handlers, these are now passed as a callback to the SDK method call as follows:

    ```javascript
    api.documents.createFromFile(file, function progressHandler() { ... });
    ```

  Some synchronous tests might be effected by this because unlike jQuery promises, Bluebird promises are completely asynchronous. When stubbing SDK methods, ensure you now return Bluebird promises instead of jQuery Deferreds.

  e.g. in Jasmine:

    ```javascript
    spyOn(api.documents, 'create').and.returnValue($.Deferred().resolve());
    // becomes
    spyOn(api.documents, 'create').and.returnValue(Bluebird.resolve());
    ```

1. The .then() success handler now only gets one parameter - the data returned by
the API call. Unless specified, headers and other xhr properties will not be accessible.

1. The SDK relies on a Promise implementation being present in the environment.
Depending on your target browsers, you may need to polyfill the Promise global.
For projects using Webpack, include the following plugin in your config:

    ```javascript
    {
        plugins: [new webpack.ProvidePlugin({
            Promise: 'bluebird'
        })];
    }
    ```

    You can use a different promise implementation here if desired.

1. Because we're running everything in Node now, we're no longer using bower to manage dependencies. Unless you're using the precompiled bundle, you will need to move your sdk dependency from bower.json to package.json and install using npm now.

1. Because the SDK no longer uses jQuery at all, it will not be possible to assign
global AJAX config using `jQuery.ajaxSetup()`
Use axios defaults instead:
https://github.com/mzabriskie/axios#global-axios-defaults

1. The notifier feature has been completely removed. All calls to `api.setNotifier()` will have to be removed from client codebases and anything relying on the events provided by this feature will have to be reworked.

1. The `.API` property is now deprecated.  Instead you should call the result of `require` as a function and use that instance to make your API requests:

    ```javascript
    // old
    var Mendeley = require('mendeley-javascript-sdk');
    Mendeley.setAuthFlow(Mendeley.Auth.implicitGrantFlow(/* ... */))
    Mendeley.API.documents.list().then(/* ... */)

    // new
    var mendeley = require('mendeley-javascript-sdk');
    var api = mendeley({
       authFlow: mendeley.Auth.implicitGrantFlow(/* ... */)
    })
    api.documents.list().then(/* ... */)
    ```

  Any attempt to access the `.API` object after creating an instance will result in an error being thrown.
