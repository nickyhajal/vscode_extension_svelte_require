const _ = require('lodash')
const isRequire = require('./is-require')

function isCommentOrEmpty(line) {
  return (
    _.isEmpty(line) ||
    line.match(/^\s*\/\//) ||
    line.match(/^\s*["']use strict["']/)
  )
}

function isLocalRequire(line) {
  return (
    line.match(/require\([\s]?['|"][.|/]/) ||
    line.match(/^import.*from\s['|"][.|/]/)
  )
}

function isNamedImport(line) {
  return line.match(line.match(/^import {/))
}

function isNamedImportEnd(line) {
  return line.match(/^.*from\s['|"]/)
}

module.exports = function(codeBlock, placeWithExternals) {
  let candidate = 0
  let findingNamedImportEnd = false
  for (let i = 0; i < codeBlock.length; i++) {
    const line = codeBlock[i]
    if (findingNamedImportEnd) {
      if (isNamedImportEnd(line)) findingNamedImportEnd = false
      candidate = i + 1
    } else if (
      isRequire(line) &&
      (!placeWithExternals || (placeWithExternals && !isLocalRequire(line)))
    ) {
      if (isNamedImport(line) && !isNamedImportEnd(line))
        findingNamedImportEnd = true
      candidate = i
    } else if (!isCommentOrEmpty(line)) {
      break
    }
  }
  return candidate
}
