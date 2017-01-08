This module can import or require node modules and local files.

Use the command dialog or the shortcut `Ctrl+Shift+1`.

## Features

* Require core modules, dependencies / devDependencies or local files.
* New requires will be added to the end of the require block in top of file.
* The style (import vs require) will be auto-detected one a per-file level. It will ask for the first dependency.
* Typical naming substitutions (for example, `lodash` will be named `_` and jQuery will be `$`).
* If the import already exists, it will not add a duplicate.

## Acknowledgements

This module is a fork from [Quick Require](https://github.com/milkmidi/vscode_extension_quick_require), which was
good, but very basic. The typical namings was taken from [NodeRequirer](https://github.com/ganemone/NodeRequirer) for
Sublime Text.