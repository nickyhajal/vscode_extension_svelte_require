const vscode = require('vscode')
const path = require('path')
const Promise = require('bluebird')
const getCoreModules = require('./get-core-modules')
const getPackageDeps = require('./get-package-deps')
const insertRequire = require('./insertRequire')

function activate(context) {
  const config = vscode.workspace.getConfiguration('node_require') || {}
  const includePattern = `**/*.{${config.include.toString()}}`
  const excludePattern = `**/{${config.exclude.toString()}}`

  const startPick = function(
    { insertAtCursor = false, multiple = false } = {}
  ) {
    const promiseOfProjectFiles = vscode.workspace.findFiles(
      includePattern,
      excludePattern
    )
    const items = []

    Promise.all([getPackageDeps(), promiseOfProjectFiles]).then(result => {
      const editor = vscode.window.activeTextEditor
      if (!editor) return

      const packageDepsArray = result[0]
      const projectFiles = result[1]

      packageDepsArray.sort().forEach(dep => {
        items.push({
          label: dep,
          description: 'module',
          fsPath: null
        })
      })

      getCoreModules().forEach(dep => {
        items.push({
          label: dep,
          description: 'core module',
          fsPath: null
        })
      })

      projectFiles.forEach(dep => {
        const rootRelative = dep.fsPath
          .replace(vscode.workspace.rootPath, '')
          .replace(/\\/g, '/')

        const label = path.basename(dep.path).match(/index\.jsx?/)
          ? `${path.basename(path.dirname(dep.path))}/${path.basename(
              dep.path
            )}`
          : path.basename(dep.path)

        items.push({
          label,
          detail: rootRelative.replace(/^\/node_modules\//, ''),
          description: rootRelative.match(/^\/node_modules\//)
            ? 'file inside module'
            : 'project file',
          fsPath: dep.fsPath
        })
      })

      const values = []
      if (multiple) {
        items.unshift({
          label: 'Finalize Selections',
          finish: true
        })
      }

      const finalizeMultiple = () => {
        Promise.mapSeries(values, value => {
          return insertRequire(value, insertAtCursor, config)
        })
      }

      const showSelectionWindow = items => {
        vscode.window
          .showQuickPick(items, {
            placeHolder: 'Select dependency',
            matchOnDescription: true,
            matchOnDetail: true
          })
          .then(value => {
            if (!value) return
            if (multiple) {
              if (value.finish) return finalizeMultiple()
              if (value) values.push(value)
              items = items.filter(i => i.label !== value.label)
              showSelectionWindow(items)
            } else {
              insertRequire(value, insertAtCursor, config)
            }
          })
      }

      showSelectionWindow(items)
    })
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('node_require.require', () => {
      startPick()
    })
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('node_require.requireAndInsert', () => {
      startPick({ insertAtCursor: true })
    })
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('node_require.requireMultiple', () => {
      startPick({ multiple: true })
    })
  )
}

exports.activate = activate

function deactivate() {}

exports.deactivate = deactivate
