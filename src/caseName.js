const _ = require('lodash')

module.exports = function(originalName, preserveAcronymCase) {
  if (preserveAcronymCase) {
    const caseName = _.startCase(originalName)
      .split(' ')
      .join('')

    if (/^[a-z]/.test(originalName)) {
      return _.lowerFirst(caseName)
    }

    return caseName
  } else {
    const camel = _.camelCase(originalName)
    const fixedCase = originalName.slice(0, 1) + camel.slice(1)
    return fixedCase
  }
}
