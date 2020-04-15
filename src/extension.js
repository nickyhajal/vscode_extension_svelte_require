const vscode = require("vscode");
const path = require("path");
const _ = require("lodash");
const insertRequire = require("./insertRequire");
const getProjectFiles = require("./getProjectFiles");
const getCoreModules = require("./getCoreModules");
const getPackageDeps = require("./getPackageDeps");
const showModulePropNames = require("./showModulePropNames");

function activate(context) {
  const config = vscode.workspace.getConfiguration("svelte_require");

  const startPick = function({
    insertAtCursor = false,
    multiple = false,
    destructuring = false,
    importAll = false
  } = {}) {
    Promise.all([getPackageDeps(), getProjectFiles(config)]).then(
      ([packageDepsArray = [], projectFiles = []]) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;
        const items = [];
        packageDepsArray.sort().forEach(dep => {
          items.push({
            label: dep.label,
            description: "module",
            fsPath: null,
            dirPath: dep.dirPath
          });
        });

        getCoreModules().forEach(dep => {
          items.push({
            label: dep,
            description: "core module",
            fsPath: null
          });
        });

        projectFiles.forEach(dep => {
          const rootRelative = dep.fsPath
            .replace(vscode.workspace.rootPath, "")
            .replace(/\\/g, "/");

          const label = path.basename(dep.path).match(/index\.(j|t)sx?/)
            ? `${path.basename(path.dirname(dep.path))}/${path.basename(
                dep.path
              )}`
            : path.basename(dep.path);

          // don't allow requiring of the file being edited
          if (editor.document.fileName === dep.fsPath) return;
          items.push({
            label,
            detail: rootRelative,
            description: "project file",
            fsPath: dep.fsPath
          });
        });

        if (multiple) {
          items.unshift({
            label: "------ Finish Selecting ------",
            finish: true
          });
        }

        const values = [];
        const finalizeMultiple = () => {
          Promise.mapSeries(values, value => {
            return insertRequire(value, insertAtCursor, config);
          });
        };

        const showSelectionWindow = items => {
          vscode.window
            .showQuickPick(items, {
              placeHolder: "Select dependency",
              matchOnDescription: true,
              matchOnDetail: true
            })
            .then(value => {
              if (!value) return;
              if (multiple) {
                if (value.finish) return finalizeMultiple();
                values.push(value);
                items = _.difference(items, values);
                showSelectionWindow(items);
              } else if (destructuring) {
                showModulePropNames(value, insertAtCursor, config);
              } else {
                insertRequire(value, insertAtCursor, config, importAll);
              }
            });
        };

        showSelectionWindow(items);
      }
    );
  };

  context.subscriptions.push(
    vscode.commands.registerCommand("svelte_require.require", () => {
      if (
        vscode.window.activeTextEditor.document.fileName.includes(".svelte")
      ) {
        startPick();
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("svelte_require.requireAndInsert", () => {
      if (
        vscode.window.activeTextEditor.document.fileName.includes(".svelte")
      ) {
        startPick({ insertAtCursor: true });
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("svelte_require.requireMultiple", () => {
      if (
        vscode.window.activeTextEditor.document.fileName.includes(".svelte")
      ) {
        startPick({ multiple: true });
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "svelte_require.destructuringImport",
      () => {
        if (
          vscode.window.activeTextEditor.document.fileName.includes(".svelte")
        ) {
          startPick({ destructuring: true });
        }
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("svelte_require.importAll", () => {
      if (
        vscode.window.activeTextEditor.document.fileName.includes(".svelte")
      ) {
        startPick({ importAll: true });
      }
    })
  );
}

exports.activate = activate;

function deactivate() {}

exports.deactivate = deactivate;
