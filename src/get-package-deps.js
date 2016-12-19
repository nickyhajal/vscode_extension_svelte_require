const vscode = require('vscode'); // eslint-disable-line

module.exports = function() {
    const localPackageJsonLocation = `${vscode.workspace.rootPath}/package.json`;
    const reqResolved = require.resolve(localPackageJsonLocation);
    if (require.cache[reqResolved]) delete require.cache[reqResolved];
    const pck = require(localPackageJsonLocation); // eslint-disable-line import/no-dynamic-require, global-require
    const dependencies = Object.assign({}, pck.dependencies || {}, pck.devDependencies || {});
    const keys = Object.keys(dependencies);
    return keys;
};
