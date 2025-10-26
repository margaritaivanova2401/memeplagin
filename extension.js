const vscode = require('vscode');
const {exec} = require('child_process');

function activate(context) {
  let disposable =
      vscode.commands.registerCommand('happy-compiler.run', function() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showErrorMessage(
              'Открой файл, который нужно скомпилировать');
          return;
        }

        const filePath = editor.document.fileName;
        const ext = filePath.split('.').pop();

        let compileCommand;

        if (ext === 'cpp') {
          compileCommand = `g++ "${filePath}" -o "${filePath}.out"`;
        } else if (ext === 'c') {
          compileCommand = `gcc "${filePath}" -o "${filePath}.out"`;
        } else if (ext === 'java') {
          compileCommand = `javac "${filePath}"`;
        } else {
          vscode.window.showErrorMessage(
              'Плагин поддерживает только .cpp, .c и .java файлы');
          return;
        }

        vscode.window.showInformationMessage('Компиляция...');

        exec(compileCommand, (error, stdout, stderr) => {
          const panel = vscode.window.createWebviewPanel(
              'happyCompiler', '🎭 Compilation Result', vscode.ViewColumn.Two, {
                enableScripts: true,
                localResourceRoots:
                    [vscode.Uri.joinPath(context.extensionUri, 'media')]
              });

          const happyImg = panel.webview.asWebviewUri(
              vscode.Uri.joinPath(context.extensionUri, 'media', 'happy.png'));
          const sadImg = panel.webview.asWebviewUri(
              vscode.Uri.joinPath(context.extensionUri, 'media', 'sad.png'));

          if (error) {
            panel.webview.html = getWebviewContent(false, sadImg, stderr);
          } else {
            panel.webview.html = getWebviewContent(true, happyImg, stdout);
          }
        });
      });

  context.subscriptions.push(disposable);
}

function getWebviewContent(success, imgUri, logText) {
  const bg = success ? '#202f20' : '#2f2020';
  const title = success ? '✅ Компиляция успешна!' : '❌ Ошибка компиляции!';
  return `
        <html>
        <body style="background:${
      bg}; color:white; text-align:center; font-family:sans-serif;">
            <h1>${title}</h1>
            <img src="${imgUri}" width="300" />
            <pre style="text-align:left; background:#111; padding:10px; border-radius:10px; max-height:300px; overflow:auto;">${
      logText}</pre>
        </body>
        </html>
    `;
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
