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
const getPackageDeepFiles = require('./get-package-deep-files');

function activate(context) {
    const config = vscode.workspace.getConfiguration('bitk_node_require') || {};
    const includePattern = `**/*.{${config.include.toString()}}`;
    const excludePattern = `**/{${config.exclude.toString()}}`;
    const getDeepFilesIfEnabled = () => (config.search_module_files ? getPackageDeepFiles() : Promise.resolve([]));

    getDeepFilesIfEnabled();

    const startPick = function({ insertAtCursor = false }) {
        const promiseOfProjectFiles = vscode.workspace.findFiles(includePattern, excludePattern);

        Promise.all([promiseOfProjectFiles, getDeepFilesIfEnabled()])
            .then(result => _.flatten(result))
            .then((result) => {
                const editor = vscode.window.activeTextEditor;

                if (!editor) {
                    return;
                }

                const items = [];

                getPackageDeps().sort().forEach((dep) => {
                    items.push({
                        label: dep,
                        description: 'module',
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

                result.forEach((dep) => {
                    const rootRelative = dep.fsPath
                        .replace(vscode.workspace.rootPath, '')
                        .replace(/\\/g, '/');

                    const label = path.basename(dep.path).match(/index\.jsx?/)
                        ? `${path.basename(path.dirname(dep.path))}/${path.basename(dep.path)}`
                        : path.basename(dep.path);

                    items.push({
                        label,
                        detail: rootRelative.replace(/^\/node_modules\//, ''),
                        description: rootRelative.match(/^\/node_modules\//) ? 'file inside module' : 'project file',
                        fsPath: dep.fsPath,
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
                        if (editor.document.fileName === value.fsPath) {
                            vscode.window.showErrorMessage('You are trying to require this file.');
                            return;
                        }

                        const rootPathRelative = value.fsPath.slice(vscode.workspace.rootPath.length);
                        const isInModules = !!rootPathRelative.match(/^\/node_modules\//i);

                        if (isInModules) {
                            relativePath = rootPathRelative.slice(14);
                        } else {
                            const dirName = path.dirname(editor.document.fileName);
                            relativePath = path.relative(dirName, value.fsPath);
                            relativePath = relativePath.replace(/\\/g, '/');
                        }

                        if (path.basename(relativePath).toLowerCase() === 'index.js') {
                            relativePath = relativePath.slice(0, relativePath.length - '/index.js'.length);
                        }

                        importName = caseName(path.basename(relativePath).split('.')[0]);

                        if (!isInModules && relativePath.indexOf('../') === -1) {
                            relativePath = `./${relativePath}`;
                        }

                        relativePath = relativePath.replace(/\.jsx?/, '');
                    } else {
                        relativePath = value.label;
                        const commonName = commonNames(value.label, config.aliases);
                        importName = commonName || caseName(value.label);
                    }

                    const codeBlock = editor.document.getText().split(os.EOL);
                    const lineStart = getPosition(editor.document.getText().split(os.EOL));
                    const cursorPosition = editor.selection.active;

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
                            editor.edit((editBuilder) => {
                                const position = new vscode.Position(lineStart, 0);
                                const insertText = !_.isEmpty(codeBlock[lineStart]) ? `${script}\n\n` : `${script}\n`;
                                if (!codeBlock.some(line => line === script)) editBuilder.insert(position, insertText);
                                if (insertAtCursor) editBuilder.insert(cursorPosition, importName);
                            });
                        });
                });
            });
    };

    context.subscriptions.push(vscode.commands.registerCommand('bitk_node_require.require', () => {
        startPick({ insertAtCursor: false });
    }));

    context.subscriptions.push(vscode.commands.registerCommand('bitk_node_require.requireAndInsert', () => {
        startPick({ insertAtCursor: true });
    }));
}

exports.activate = activate;

function deactivate() {
}

exports.deactivate = deactivate;
