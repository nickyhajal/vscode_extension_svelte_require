const _ = require('lodash');
const isRequire = require('./is-require');

function isCommentOrEmpty(line) {
    return _.isEmpty(line) || line.match(/^\s*\/\//) || line.match(/^\s*["']use strict["']/);
}

function isLocalRequire(line) {
    return line.match(/require\([\s]?['|"][.|/]/) || line.match(/^import.*from\s['|"][.|/]/);
}

module.exports = function(codeBlock, placeWithExternals) {
    let candidate = 0;
    for (let i = 0; i < codeBlock.length; i += 1) {
        const line = codeBlock[i];
        if (isRequire(line) && (
            !placeWithExternals ||
            (placeWithExternals && !isLocalRequire(line))
           )
        ) {
            candidate = i + 1;
        } else if (!isCommentOrEmpty(line)) {
            break;
        }
    }
    return candidate;
};
