const vscode = require('vscode') // eslint-disable-line

module.exports = function(config) {
  const includePattern = `**/*.{${config.include.toString()}}`
  const excludePattern = `**/{${config.exclude.toString()}}`
  const promiseOfProjectFiles = vscode.workspace.findFiles(
    includePattern,
    excludePattern
  )
  return promiseOfProjectFiles
}
