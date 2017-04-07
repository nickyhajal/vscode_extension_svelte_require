const _ = require('lodash');

function isRequire(line) {
    return line.match(/require\(/) || line.match(/^import/);
}

function isCommentOrEmpty(line) {
    return _.isEmpty(line) || line.match(/^\s*\/\//) || line.match(/^\s*["']use strict["']/);
}

module.exports = function(codeBlock) {
    let candidate = 0;

    for (let i = 0; i < codeBlock.length; i += 1) {
        const line = codeBlock[i];

        if (isRequire(line)) {
            candidate = i + 1;
        } else if (!isCommentOrEmpty(line)) {
            break;
        }
    }

    return candidate;
};
