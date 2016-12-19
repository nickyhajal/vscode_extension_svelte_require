const vscode = require('vscode');

module.exports = function() {
    const localPackageJsonLocation = `${vscode.workspace.rootPath}/package.json`;
    const reqResolved = require.resolve(localPackageJsonLocation);
    if (require.cache[reqResolved]) delete require.cache[reqResolved];
    const package = require(localPackageJsonLocation);
    const dependencies = Object.assign({}, package.dependencies || {}, package.devDependencies || {});
    const keys = Object.keys(dependencies);
    return keys;
};
