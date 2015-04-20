define(['./request'], function(Request) {

    'use strict';

    var baseUrl = 'https://api.mendeley.com';
    var authFlow = false;
    var notifier = false;

    /**
     * Utilities
     *
     * @namespace
     * @name utilities
     */
    return {
        setAuthFlow: setAuthFlow,
        setBaseUrl: setBaseUrl,
        setNotifier: setNotifier,

        requestFun: requestFun,
        requestPageFun: requestPageFun,
        requestWithDataFun: requestWithDataFun,
        requestWithFileFun: requestWithFileFun,

        resetPaginationLinks: resetPaginationLinks
    };

    function setAuthFlow(auth) {
        authFlow = auth;
    }

    function setBaseUrl(url) {
        baseUrl = url;
    }

    function setNotifier(newNotifier) {
        notifier = newNotifier;
    }

    /**
     * A general purpose request functions
     *
     * @private
     * @param {string} method
     * @param {string} uriTemplate
     * @param {array} uriVars
     * @param {array} headers
     * @returns {function}
     */
    function requestFun(method, uriTemplate, uriVars, headers) {

        uriVars = uriVars || [];

        return function() {
            var args = Array.prototype.slice.call(arguments, 0);
            var url = getUrl(uriTemplate, uriVars, args);
            var data = args[uriVars.length];
            var request = {
                type: method,
                dataType: 'json',
                url: url,
                headers: getRequestHeaders(headers),
                data: data
            };
            var settings = {
                authFlow: authFlow
            };

            if (method === 'GET') {
                settings.maxRetries = 1;
            }

            var promise = Request.create(request, settings, notifier).send();
            promise.done(function(response, headers) {
                setPaginationLinks.call(this, headers);
            }.bind(this));

            return promise;
        };
    }

    /**
     * Get a function for getting a pagination rel
     *
     * @private
     * @param {string} rel - One of "next", "prev" or "last"
     * @returns {function}
     */
    function requestPageFun(rel) {

        return function() {
            if (!this.paginationLinks[rel]) {
                return new $.Deferred().reject();
            }

            var request = {
                type: 'GET',
                dataType: 'json',
                url: this.paginationLinks[rel],
                headers: getRequestHeaders({})
            };

            var settings = {
                authFlow: authFlow,
                maxRetries: 1
            };

            var promise = Request.create(request, settings, notifier).send();
            promise.done(function(response, headers) {
                setPaginationLinks.call(this, headers);
            }.bind(this));

            return promise;
        };
    }

    /**
     * Get a request function that sends data i.e. for POST, PUT, PATCH
     * The data will be taken from the calling argument after any uriVar arguments.
     *
     * @private
     * @param {string} method - The HTTP method
     * @param {string} uriTemplate - A URI template e.g. /documents/{id}
     * @param {array} uriVars - The variables for the URI template in the order
     * they will be passed to the function e.g. ['id']
     * @param {object} headers - Any additional headers to send
     *  e.g. { 'Content-Type': 'application/vnd.mendeley-documents+1.json'}
     * @param {bool} followLocation - follow the returned location header? Default is false
     * @returns {function}
     */
    function requestWithDataFun(method, uriTemplate, uriVars, headers, followLocation) {
        uriVars = uriVars || [];

        return function() {
            var args = Array.prototype.slice.call(arguments, 0);
            var url = getUrl(uriTemplate, uriVars, args);
            var data = args[uriVars.length];
            var request = {
                type: method,
                url: url,
                headers: getRequestHeaders(headers, data),
                data: JSON.stringify(data),
                processData: false
            };

            var settings = {
                authFlow: authFlow,
                followLocation: followLocation
            };

            return Request.create(request, settings, notifier).send();
        };
    }

    /**
     * Get a request function that sends a file
     *
     * @private
     * @param {string} method
     * @param {string} uriTemplate
     * @returns {function}
     */
    function requestWithFileFun(method, uriTemplate, linkType) {

        return function() {

            var args = Array.prototype.slice.call(arguments, 0);
            var url = getUrl(uriTemplate, [], args);
            var file = args[0];
            var linkId = args[1];
            var request = {
                type: method,
                url: url,
                headers: getRequestHeaders(uploadHeaders(file, linkId, linkType), method),
                data: file,
                processData: false
            };

            var settings = {
                authFlow: authFlow,
                fileUpload: true
            };

            return Request.create(request, settings, notifier).send();
        };
    }

    /**
     * Provide the correct encoding for UTF-8 Content-Disposition header value.
     * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
     *
     * @private
     * @param {string} str
     * @returns {string}
     */
    function encodeRFC5987ValueChars(str) {
        return encodeURIComponent(str).
            replace(/'/g, '%27').
            replace(/\(/g, '%28').
            replace(/\)/g, '%29').
            replace(/\*/g, '%2A');
    }

    /**
     * Get headers for an upload
     *
     * @private
     * @param {object} file
     * @param {string} documentId
     * @returns {string}
     */
    function uploadHeaders(file, linkId, linkType) {
        var headers = {
            'Content-Type': !!file.type ? file.type : 'application/octet-stream',
            'Content-Disposition': 'attachment; filename*=UTF-8\'\'' + encodeRFC5987ValueChars(file.name)
        };
        if (linkType && linkId) {
            switch(linkType) {
                case 'group':
                    headers.Link = '<' + baseUrl + '/groups/' + linkId +'>; rel="group"';
                    break;
                case 'document':
                    headers.Link = '<' + baseUrl + '/documents/' + linkId +'>; rel="document"';
                    break;
            }
        }

        return headers;
    }

    /**
     * Generate a URL from a template with properties and values
     *
     * @private
     * @param {string} uriTemplate
     * @param {array} uriProps
     * @param {array} uriValues
     * @returns {string}
     */
    function getUrl(uriTemplate, uriProps, uriValues) {
        if (!uriProps.length) {
            return baseUrl + uriTemplate;
        }
        var uriParams = {};
        uriProps.forEach(function(prop, i) {
            uriParams[prop] = uriValues[i];
        });

        return baseUrl + expandUriTemplate(uriTemplate, uriParams);
    }

    /**
     * Get the headers for a request
     *
     * @private
     * @param {array} headers
     * @param {array} data
     * @returns {array}
     */
    function getRequestHeaders(headers, data) {
        for (var headerName in headers) {
            var val = headers[headerName];
            if (typeof val === 'function') {
                headers[headerName] = val(data);
            }
        }

        return headers;
    }

    /**
     * Populate a URI template with data
     *
     * @private
     * @param {string} template
     * @param {object} data
     * @returns {string}
     */
    function expandUriTemplate(template, data) {
        var matches = template.match(/\{[a-z]+\}/gi);
        matches.forEach(function(match) {
            var prop = match.replace(/[\{\}]/g, '');
            if (!data.hasOwnProperty(prop)) {
                throw new Error('Endpoint requires ' + prop);
            }
            template = template.replace(match, data[prop]);
        });

        return template;
    }

    /**
     * Set the current pagination links for a given API by extracting
     * looking at the headers retruend with the response.
     *
     * @private
     * @param {object} headers
     */
    function setPaginationLinks(headers) {
        if (headers.hasOwnProperty('Mendeley-Count')) {
            this.count = parseInt(headers['Mendeley-Count'], 10);
        }

        if (!headers.hasOwnProperty('Link') || typeof headers.Link !== 'object') {
            return ;
        }

        for (var p in this.paginationLinks) {
            this.paginationLinks[p] = headers.Link.hasOwnProperty(p) ? headers.Link[p] : false;
        }
    }

    /**
     * Reset the pagination links
     *
     * @private
     */
    function resetPaginationLinks() {
        this.paginationLinks = {
            last: false,
            next: false,
            previous: false
        };
        this.count = 0;
    }

});
