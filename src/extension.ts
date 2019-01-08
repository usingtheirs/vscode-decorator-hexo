import * as vscode from 'vscode';

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) {

	console.log('vscode-decorator-hexo is activated');

	const codeblockType = vscode.window.createTextEditorDecorationType({
		color: { id: 'hexo.codeblock.textcolor' },
		
	});
	const commentType = vscode.window.createTextEditorDecorationType({
		color: { id: 'hexo.comment.textcolor' }
	});
	const tagType = vscode.window.createTextEditorDecorationType({
		color: { id: 'hexo.tag.textcolor' }
		//backgroundColor: { id: 'hexo.tag.textcolor' }
		//borderWidth: '1px',
		//borderStyle: 'solid',
		//overviewRulerColor: 'blue',
		//overviewRulerLane: vscode.OverviewRulerLane.Right,
		// light: {
		// 	// this color will be used in light color themes
		// 	borderColor: 'darkblue'
		// },
		// dark: {
		// 	// this color will be used in dark color themes
		// 	borderColor: 'lightblue'
		// }
	});

	let activeEditor = vscode.window.activeTextEditor;
	if (activeEditor) {
		triggerUpdateDecorations();
	}

	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (editor) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		if (activeEditor && event.document === activeEditor.document) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions)

	var  timeout: NodeJS.Timer | null = null;
	function triggerUpdateDecorations() {
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(updateDecorations, 500);
	}

	function setDecorations( regEx, matchIndex, textEditorDecorationType,  hoverMessage )
	{
		if (!activeEditor) {
			return;
		}
		
		const text = activeEditor.document.getText();
		const decorations: vscode.DecorationOptions[] = [];
		let match;
		while (match = regEx.exec(text)) {
			// match[0] : whole match
			// match[1] : the first group
			// match[2] : the second group
			// ...
			const skipPosition = matchIndex < 2 ? 0 : match[matchIndex - 1].length;
			const startPos = activeEditor.document.positionAt(match.index + skipPosition);
			const endPos = activeEditor.document.positionAt(match.index + skipPosition + match[matchIndex].length);
			const decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: hoverMessage + ' **' + match[matchIndex] + '**' };
				decorations.push(decoration);
		}
		activeEditor.setDecorations(textEditorDecorationType, decorations);
	}

	function updateDecorations() {
		if (!activeEditor) {
			return;
		}

		setDecorations( /{%.*?%}/g, 0, tagType, "tag" );
		setDecorations( /({%\s*?codeblock.*?%})([\s\S]*?)(?={%\s*?endcodeblock\s*?%})/g, 2, codeblockType, "codeblock" );
		setDecorations( /({%\s*?ut_comment\s*?%})([\s\S]*?)(?={%\s*?endut_comment\s*?%})/g, 2, commentType, "comment" );
	}
}
