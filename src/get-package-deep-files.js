const vscode = require('vscode'); // eslint-disable-line
const getPackageDeps = require('./get-package-deps');
const _ = require('lodash');

const SEARCH_INTERVAL = 2 * 60 * 1000;

function searchDepFiles() {
    const config = vscode.workspace.getConfiguration('bitk_node_require') || {};
    const includePattern = `**/*.{${config.include.toString()}}`;
    const excludePattern = `**/{${config.exclude.toString()}}`;

    return Promise.all(
        getPackageDeps().map((dep) => {
            const depIncludePattern = `node_modules/${dep}/${includePattern}`;
            const depExcludePattern = `node_modules/${dep}/${excludePattern}`;
            return vscode.workspace.findFiles(depIncludePattern, depExcludePattern);
        })
    ).then(result => _.flatten(result));
}

let cache = null;
let runningPromise = Promise.resolve([]);

function rebuildCache() {
    runningPromise = searchDepFiles()
        .then(result => result.sort())
        .then((result) => {
            cache = result;
            setTimeout(rebuildCache, SEARCH_INTERVAL);
            return cache;
        });
}

rebuildCache();

function fileCachePromise() {
    if (cache) return Promise.resolve(cache);
    return runningPromise;
}

module.exports = function() {
    return fileCachePromise();
};
