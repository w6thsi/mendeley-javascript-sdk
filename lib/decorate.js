'use strict';

module.exports = function decorateWithFor(originalInstance, factory, options) {
    var instanceMap = {};

    originalInstance.for = function (mappingKey) {
        if (!mappingKey) {
            return originalInstance;
        }

        if (!instanceMap[mappingKey]) {
            // create a new instance
            instanceMap[mappingKey] = factory(options);
        }

        return instanceMap[mappingKey];
    };

    return originalInstance;
};
