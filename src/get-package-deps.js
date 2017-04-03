const vscode = require('vscode'); // eslint-disable-line

let warningShown = false;

module.exports = function() {
    const localPackageJsonLocation = `${vscode.workspace.rootPath}/package.json`;

    try {
        const reqResolved = require.resolve(localPackageJsonLocation);
        if (require.cache[reqResolved]) delete require.cache[reqResolved];
        const pck = require(localPackageJsonLocation); // eslint-disable-line import/no-dynamic-require, global-require
        const dependencies = Object.assign({}, pck.dependencies || {}, pck.devDependencies || {});
        const keys = Object.keys(dependencies);
        return keys;
    } catch (e) {
        if (!warningShown) {
            vscode.window.showWarningMessage('No package.json file in root folder. Only showing core modules and local files.');
            warningShown = true;
        }

        return [];
    }
};
