const vscode = require( 'vscode' );
const path = require( 'path' );
const commonNames = require('./common-names');
const getCoreModules = require('./get-core-modules');
const getPackageDeps = require('./get-package-deps');

const TYPE_REQUIRE = 0;
const TYPE_IMPORT = 1;

function activate( context ) {
    const config = vscode.workspace.getConfiguration( 'quickrequire' ) || {};
    const include = config.include;
    const exclude = config.exclude;        
    const includePattern = '/**/*.{' + include.toString() +"}"; 
    console.log( includePattern );
    const excludePattern = '**/{' + exclude.toString() + '}';
    console.log( excludePattern );

    var startPick = function( type ){
        vscode.workspace.findFiles( includePattern, excludePattern , 100 ).then( result => {
            var edit = vscode.window.activeTextEditor;

            if ( !edit ) {
                return;
            }

            var items = [];

            getPackageDeps().forEach(dep => {
                items.push({
                    label: dep,
                    description: 'package dependency',
                    fsPath: null
                })
            });

            getCoreModules().forEach(dep => {
                items.push({
                    label: dep,
                    description: 'core module',
                    fsPath: null,
                });
            });

            result.forEach(dep => {
                if ( dep.fsPath.indexOf( 'gulpfile.js' ) != -1 || dep.fsPath.indexOf( 'dist' ) != -1 ) {
                    continue;
                }

                items.push( {
                    label: path.basename(dep.path),
                    description: dep.fsPath.replace( vscode.workspace.rootPath, '' ).replace( /\\/g, "/" ),
                    fsPath: dep.fsPath
                });
            });

            vscode.window.showQuickPick( items, { placeHolder: 'select file' }).then(( value ) => {
                if ( !value ) {
                    return;
                }

                var relativePath;
                var fileName;

                if (value.fsPath) {
                    var dirName = path.dirname( edit.document.fileName );
                    relativePath = path.relative( dirName, value.fsPath );
                    relativePath = relativePath.replace( /\\/g, "/" );
                    fileName = path.basename( value.fsPath ).split('.')[0];                
                    if ( relativePath.indexOf( "../" ) == - 1 ) {
                        relativePath = "./" + relativePath;
                    }
                    relativePath = relativePath.replace('.js','');
                } else {
                    relativePath = value.label;
                    fileName = commonNames(value.label);
                }

                var script;
                if( type === TYPE_REQUIRE){
                    script = "const " + fileName + " = require(\'" + relativePath + "\');\n";
                }else{
                    script = "import " + fileName + " from \'" + relativePath + "\';\n";
                }
                
                edit.edit(( editBuilder ) => {
                    var position = new vscode.Position( 0, 0 );
                    editBuilder.insert( position, script );
                });         
            });
        });
    };

    var disposable = vscode.commands.registerCommand( 'extension.quickRequire', ()=> {        
        startPick( TYPE_REQUIRE );
    });

    context.subscriptions.push( disposable );

    disposable = vscode.commands.registerCommand( 'extension.quickRequire_import', ()=> {
        startPick( TYPE_IMPORT);
    });

    context.subscriptions.push( disposable );
}
exports.activate = activate;

function deactivate() {
}
exports.deactivate = deactivate;