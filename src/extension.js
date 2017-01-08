const vscode = require('vscode'); // eslint-disable-line
const path = require('path');
const os = require('os');
const commonNames = require('./common-names');
const getCoreModules = require('./get-core-modules');
const getPackageDeps = require('./get-package-deps');
const getPosition = require('./get-position');
const caseName = require('./case-name');
const detectFileRequireMethod = require('./detectFileRequireMethod');
const constants = require('./constants');
const _ = require('lodash');

function activate(context) {
    const config = vscode.workspace.getConfiguration('quickrequire') || {};
    const includePattern = `/**/*.{${config.include.toString()}}`;
    const excludePattern = `**/{${config.exclude.toString()}}`;

    const startPick = function() {
        vscode.workspace.findFiles(includePattern, excludePattern, 100).then((result) => {
            const editor = vscode.window.activeTextEditor;

            if (!editor) {
                return;
            }

            const items = [];

            result.forEach((dep) => {
                items.push({
                    label: path.basename(dep.path),
                    description: dep.fsPath.replace(vscode.workspace.rootPath, '').replace(/\\/g, '/'),
                    fsPath: dep.fsPath,
                });
            });

            getPackageDeps().sort().forEach((dep) => {
                items.push({
                    label: dep,
                    description: 'package dependency',
                    fsPath: null,
                });
            });

            getCoreModules().sort().forEach((dep) => {
                items.push({
                    label: dep,
                    description: 'core module',
                    fsPath: null,
                });
            });

            vscode.window.showQuickPick(items, {
                placeHolder: 'Select dependency',
                matchOnDescription: true,
                matchOnDetail: true,
            }).then((value) => {
                if (!value) {
                    return;
                }

                let relativePath;
                let importName;

                if (value.fsPath) {
                    const dirName = path.dirname(editor.document.fileName);
                    relativePath = path.relative(dirName, value.fsPath);
                    relativePath = relativePath.replace(/\\/g, '/');

                    if (path.basename(relativePath).toLowerCase() === 'index.js') {
                        relativePath = relativePath.slice(0, relativePath.length - '/index.js'.length);
                    }

                    importName = caseName(path.basename(relativePath).split('.')[0]);

                    if (relativePath.indexOf('../') === -1) {
                        relativePath = `./${relativePath}`;
                    }

                    relativePath = relativePath.replace(/\.jsx?/, '');
                } else {
                    relativePath = value.label;
                    const commonName = commonNames(value.label);
                    importName = commonName || caseName(value.label);
                }

                const codeBlock = editor.document.getText().split(os.EOL);
                const lineStart = getPosition(editor.document.getText().split(os.EOL));
                // const cursorPosition = editor.selection.active;

                Promise
                    .resolve(detectFileRequireMethod(codeBlock))
                    .then((requireMethod) => {
                        if (requireMethod !== null) return requireMethod;

                        return vscode.window
                            .showQuickPick([
                                { label: 'require', value: constants.TYPE_REQUIRE },
                                { label: 'import', value: constants.TYPE_IMPORT },
                            ], { placeHolder: 'Select import style' })
                            .then(style => style.value);
                    })
                    .then((requireMethod) => {
                        let script;

                        if (requireMethod === constants.TYPE_REQUIRE) {
                            script = `const ${importName} = require('${relativePath}');`;
                        } else {
                            script = `import ${importName} from '${relativePath}';`;
                        }

                        return script;
                    })
                    .then((script) => {
                        if (codeBlock.some(line => line === script)) return;

                        editor.edit((editBuilder) => {
                            const position = new vscode.Position(lineStart, 0);
                            const insertText = !_.isEmpty(codeBlock[lineStart]) ? `${script}\n\n` : `${script}\n`;
                            editBuilder.insert(position, insertText);
                            // editBuilder.insert(cursorPosition, importName);
                        });
                    });
            });
        });
    };

    context.subscriptions.push(vscode.commands.registerCommand('bitk_require.quickRequire', () => {
        startPick();
    }));
}

exports.activate = activate;

function deactivate() {
}

exports.deactivate = deactivate;
