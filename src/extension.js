const vscode = require( 'vscode' );
const path = require( 'path' );
const wwwRoot = vscode.workspace.rootPath;

function activate( context ) {
    var disposable = vscode.commands.registerCommand( 'extension.quickRequire', function () {
        var edit = vscode.window.activeTextEditor;
        if ( !edit ) {
            return;
        }
        /*var CURRENT_OPEN_FILE_URI = edit.document.uri;
        console.log( 'CURRENT_OPEN_FILE_URI.path='+ CURRENT_OPEN_FILE_URI.path );
        var ROOT_URI = vscode.Uri.file( wwwRoot);
        console.log( 'wwwRoot.path=' + ROOT_URI.path);*/

        // console.log( 'currentOpenFile= '+ edit.document.fileName );
        // console.log( 'wwwRoot= '+ wwwRoot );
        
        vscode.workspace.findFiles( '**/*.js', '**/node_modules/**', 100 ).then(( result ) => {
            // console.log( result );            
            var items = [];
            for ( var i = 0; i < result.length; i++ ) {
                var o = result[i];
                if ( o.fsPath.indexOf( 'gulpfile.js' ) != -1 || o.fsPath.indexOf( 'dist' ) != -1 ) {
                    continue;
                }                
                items.push( {
                    label: path.basename(o.path),
                    description: o.fsPath.replace( wwwRoot, '' ).replace( /\\/g, "/" ),
                    fsPath: o.fsPath
                    // path:o.path
                });
            }            
            vscode.window.showQuickPick( items, { placeHolder: 'select file' }).then(( value ) => {
                if ( !value ) {
                    return;
                }
                // console.log( '__________________________ pick select' );
                // console.log( value );
                var dirName = path.dirname( edit.document.fileName );                
                // console.log('dirName', dirName );

                var relativePath = path.relative( dirName, value.fsPath );
                relativePath = relativePath.replace( /\\/g, "/" );
                // relativePath =relativePath.substr(3 , relativePath.length); 
                var fileName = path.basename( value.fsPath, '.js' );
                if ( relativePath.indexOf( "../" ) == - 1 ) {
                    relativePath = "./" + relativePath;
                }
                var script = "const " + fileName + " = require(\"" + relativePath + "\");\n";
                // console.log( script );
                edit.edit(( editBuilder ) => {
                    var position = new vscode.Position( 0, 0 );
                    editBuilder.insert( position, script );
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
 
function fixRelativePath( s ) {
    var arr = s.split( '../' );
    if ( arr.length ) {

    }
}*/
