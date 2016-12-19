const vscode = require('vscode'); // eslint-disable-line
const path = require('path');
const commonNames = require('./common-names');
const getCoreModules = require('./get-core-modules');
const getPackageDeps = require('./get-package-deps');

const TYPE_REQUIRE = 0;
const TYPE_IMPORT = 1;

function activate(context) {
    const config = vscode.workspace.getConfiguration('quickrequire') || {};
    const includePattern = `/**/*.{${config.include.toString()}}`;
    const excludePattern = `**/{${config.exclude.toString()}}`;

    const startPick = function(type) {
        vscode.workspace.findFiles(includePattern, excludePattern, 100).then((result) => {
            const edit = vscode.window.activeTextEditor;

            if (!edit) {
                return;
            }

            const items = [];

            getPackageDeps().forEach((dep) => {
                items.push({
                    label: dep,
                    description: 'package dependency',
                    fsPath: null,
                });
            });

            getCoreModules().forEach((dep) => {
                items.push({
                    label: dep,
                    description: 'core module',
                    fsPath: null,
                });
            });

            result.forEach((dep) => {
                items.push({
                    label: path.basename(dep.path),
                    description: dep.fsPath.replace(vscode.workspace.rootPath, '').replace(/\\/g, '/'),
                    fsPath: dep.fsPath,
                });
            });

            vscode.window.showQuickPick(items, { placeHolder: 'select file' }).then((value) => {
                if (!value) {
                    return;
                }

                let relativePath;
                let fileName;

                if (value.fsPath) {
                    const dirName = path.dirname(edit.document.fileName);
                    relativePath = path.relative(dirName, value.fsPath);
                    relativePath = relativePath.replace(/\\/g, '/');
                    fileName = path.basename(value.fsPath).split('.')[0];

                    if (relativePath.indexOf('../') === -1) {
                        relativePath = `./${relativePath}`;
                    }

                    relativePath = relativePath.replace('.js', '');
                } else {
                    relativePath = value.label;
                    fileName = commonNames(value.label);
                }

                let script;

                if (type === TYPE_REQUIRE) {
                    script = `const ${fileName} = require('${relativePath}');\n`;
                } else {
                    script = `import ${fileName} from '${relativePath}';\n`;
                }

                edit.edit((editBuilder) => {
                    const position = new vscode.Position(0, 0);
                    editBuilder.insert(position, script);
                });
            });
        });
    };

    context.subscriptions.push(vscode.commands.registerCommand('extension.quickRequire', () => {
        startPick(TYPE_REQUIRE);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('extension.quickRequire_import', () => {
        startPick(TYPE_IMPORT);
    }));
}

exports.activate = activate;

function deactivate() {
}

exports.deactivate = deactivate;
