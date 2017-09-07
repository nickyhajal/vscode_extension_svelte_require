const isRequire = require('./isRequire')
const {
  isNamedImport,
  isEndOfBlockComment,
  isStartOfBlockComment,
  isNamedImportEnd,
  isStyleRequire,
  isLocalRequire,
  isCommentOrEmpty
} = require('./lineUtils')

module.exports = function(codeBlock, placeWithExternals) {
  let candidate = 0
  let findingNamedImportEnd = false
  let findingBlockCommentEnd = false

  for (let i = 0; i < codeBlock.length; i++) {
    const line = codeBlock[i]
    if (findingNamedImportEnd) {
      if (isNamedImportEnd(line)) findingNamedImportEnd = false
      candidate = i + 1
    } else if (findingBlockCommentEnd) {
      if (isEndOfBlockComment(line)) findingBlockCommentEnd = false
      candidate = i + 1
    } else if (isStartOfBlockComment(line) && !isEndOfBlockComment(line)) {
      findingBlockCommentEnd = true
      candidate = i + 1
    } else if (
      isRequire(line) &&
      (!placeWithExternals || (placeWithExternals && !isLocalRequire(line)))
    ) {
      // require/imports should come before style imports
      if (isStyleRequire(line)) break
      else if (isNamedImport(line) && !isNamedImportEnd(line))
        findingNamedImportEnd = true
      else candidate = i + 1
    } else if (!isCommentOrEmpty(line)) {
      break
    }
  }
  return candidate
}
