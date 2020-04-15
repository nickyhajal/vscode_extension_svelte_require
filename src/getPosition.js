const isRequire = require("./isRequire");
const {
  isNamedImport,
  isEndOfBlockComment,
  isStartOfBlockComment,
  isNamedImportEnd,
  isLocalNamedImportEnd,
  isStyleRequire,
  isLocalRequire,
  isCommentOrEmpty,
  isShebang
} = require("./lineUtils");

module.exports = function(codeBlock, placeWithExternals) {
  let candidate = 0;
  let candidateBeforeNamedImport = 0;
  let findingNamedImportEnd = false;
  let findingBlockCommentEnd = false;
  let importOrRequireHit = false;

  for (let i = 0; i < codeBlock.length; i++) {
    const line = codeBlock[i];
    if (findingNamedImportEnd) {
      if (isNamedImportEnd(line)) {
        if (isLocalNamedImportEnd(line) && placeWithExternals) {
          return candidateBeforeNamedImport;
        }
        findingNamedImportEnd = false;
      }
      candidate = i + 1;
    } else if (findingBlockCommentEnd) {
      if (isEndOfBlockComment(line)) findingBlockCommentEnd = false;
      candidate = i + 1;
    } else if (isStartOfBlockComment(line) && !isEndOfBlockComment(line)) {
      // if a block comment is found below the require/import statements
      if (importOrRequireHit) break;
      findingBlockCommentEnd = true;
      candidate = i + 1;
    } else if (isStartOfBlockComment(line) && isEndOfBlockComment(line)) {
      candidate = i + 1;
    } else if (isShebang(line)) {
      candidate = i + 1;
    } else if (
      isRequire(line) &&
      (!placeWithExternals || (placeWithExternals && !isLocalRequire(line)))
    ) {
      // require/imports should come before style imports
      if (isStyleRequire(line)) break;
      else if (isNamedImport(line) && !isNamedImportEnd(line)) {
        findingNamedImportEnd = true;
        candidateBeforeNamedImport = i;
      } else candidate = i + 1;
      importOrRequireHit = true;
    } else if (!isCommentOrEmpty(line)) {
      break;
    }
  }
  return candidate;
};
