const isRequire = require('./is-require')

module.exports = function(codeBlock) {
  for (let i = 0; i < codeBlock.length; i += 1) {
    const line = codeBlock[i]
    if (isRequire(line) && line.match(/;/)) return true
  }

  return false
}
