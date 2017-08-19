const constants = require('./constants')

module.exports = function(codeBlock) {
  for (let i = 0; i < codeBlock.length; i += 1) {
    if (codeBlock[i].match(/^import/)) return constants.TYPE_IMPORT
    if (codeBlock[i].match(/require\(/)) return constants.TYPE_REQUIRE
  }

  return null
}
