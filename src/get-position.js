

module.exports = function(codeBlock) {
    let candidate = 0;

    for (let i = 0; i < codeBlock.length; i += 1) {
        const line = codeBlock[i];
        const lineIsRequire = line.match(/require/) || line.match(/^import/);

        if (lineIsRequire) {
            candidate = i + 1;
        } else if (i > 3) {
            break;
        }
    }

    return candidate;
};
