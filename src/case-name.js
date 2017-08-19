const _ = require('lodash')

module.exports = function(originalName) {
  const camel = _.camelCase(originalName)
  const fixedCase = originalName.slice(0, 1) + camel.slice(1)
  return fixedCase
}
