const vscode = require( 'vscode' );
const path = require('path');
const wwwRoot = vscode.workspace.rootPath;


function activate( context ) {
    console.log( 'Congratulations, your extension "vs-code-quick-require" is now active!' );

    // var test = "../../src/milkmidi.js";
    // console.log( test.split('../') );

    var disposable = vscode.commands.registerCommand( 'extension.quickRequire', function () {
        var edit = vscode.window.activeTextEditor;
        if ( !edit ) {
            return;
        }
        vscode.workspace.findFiles( '**/*.js', '**/node_modules/**', 100 ).then(( result ) => {
            var items = [];
            for ( var i = 0; i < result.length; i++ ) {
                var o = result[i];
                if ( o.fsPath.indexOf( 'gulpfile.js' ) != -1 || o.fsPath.indexOf( 'dist' ) != -1) {
                    continue;
                }
                items.push( {
                    label: o.path.split( '/' ).pop(),
                    description: o.fsPath.replace( wwwRoot, '' ),
                    fsPath: o.fsPath
                });
            }      
            vscode.window.showQuickPick( items, { placeHolder: 'select file' }).then(( value ) => {
                
                if( !value ){
                    return;
                }
                // console.log( edit.document.fileName);                                
                // console.log( value.fsPath );
                var dirName = path.dirname( edit.document.fileName );
                // console.log('fName', fName );
                var relativePath = path.relative( dirName, value.fsPath);
                relativePath = relativePath.replace(/\\/g,"/");
                // relativePath =relativePath.substr(3 , relativePath.length); 
                var fileName = path.basename( value.fsPath, '.js' );
                if ( relativePath.indexOf("../") == - 1) {
                    relativePath = "./"+relativePath;
                }
                // console.log( relativePath );
                var script = "var "+fileName+" = require(\""+relativePath+"\");\n";
                // console.log( script );
                edit.edit(( editBuilder ) => {
                    var position = new vscode.Position(0,0);
                    editBuilder.insert( position, "var "+fileName+" = require(\""+relativePath+"\");\n" );
                });
            });
        });
    });

    context.subscriptions.push( disposable );
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;

/**
 * @param  {string} s
 */
function fixRelativePath( s  ) {
    var arr = s.split('../');
    if ( arr.length ) {
        
    }
}
