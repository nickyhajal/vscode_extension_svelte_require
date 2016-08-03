const vscode = require( 'vscode' );
const path = require( 'path' );
const wwwRoot = vscode.workspace.rootPath;
const TYPE_REQUIRE = 0;
const TYPE_IMPORT = 1;
function activate( context ) {
    const config = vscode.workspace.getConfiguration( 'quickrequire' ) || {};
    const include = config.include;
    const exclude = config.exclude;        
    const includePattern = include.reduce( (pre,cur,index ,arr) => { return pre + '**/*.'+cur + (index == arr.length-1 ? '}' : ','); } ,"{");
    const excludePattern = exclude.reduce( (pre,cur,index ,arr) => { return pre + '**/'+cur + (index == arr.length-1 ? '}' : ','); } ,"{");
    
    var startPick = function( type ){
        vscode.workspace.findFiles( includePattern, excludePattern , 100 ).then( result => {
            var edit = vscode.window.activeTextEditor;
            if ( !edit ) {
                return;
            }
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
                });
            }            
            vscode.window.showQuickPick( items, { placeHolder: 'select file' }).then(( value ) => {
                if ( !value ) {
                    return;
                }
                var dirName = path.dirname( edit.document.fileName );
                var relativePath = path.relative( dirName,  value.fsPath );
                relativePath = relativePath.replace( /\\/g, "/" );
                var fileName = path.basename( value.fsPath ).split('.')[0];                
                if ( relativePath.indexOf( "../" ) == - 1 ) {
                    relativePath = "./" + relativePath;
                }
                relativePath = relativePath.replace('.js','');

                var script;
                if( type === TYPE_REQUIRE){
                    script = "const " + fileName + " = require(\"" + relativePath + "\");\n";
                }else{
                    script = "import " + fileName + " from \"" + relativePath + "\";\n";
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