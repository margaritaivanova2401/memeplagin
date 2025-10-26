const vscode = require('vscode');

function activate(context) {
  let disposable =
      vscode.commands.registerCommand('happy-compiler.run', function() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showErrorMessage('Открой файл для проверки!');
          return;
        }

        const fileText = editor.document.getText();

        const panel = vscode.window.createWebviewPanel(
            'happyCompiler', 'Happy Compiler 😊', vscode.ViewColumn.One, {
              enableScripts: true,
              localResourceRoots:
                  [vscode.Uri.joinPath(context.extensionUri, 'media')]
            });

        const happyImg = panel.webview.asWebviewUri(
            vscode.Uri.joinPath(context.extensionUri, 'media', 'happy.png'));
        const sadImg = panel.webview.asWebviewUri(
            vscode.Uri.joinPath(context.extensionUri, 'media', 'sad.png'));

        // Простая проверка: если в коде есть "error" или "Ошибка", то ошибка
        if (fileText.includes('error') || fileText.includes('Ошибка')) {
          panel.webview.html =
              getWebviewContent(sadImg, '😢 Ошибка компиляции');
        } else {
          panel.webview.html =
              getWebviewContent(happyImg, '🎉 Компиляция успешна!');
        }
      });

  context.subscriptions.push(disposable);
}

function getWebviewContent(imgUri, message) {
  return `
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <title>Happy Compiler</title>
            <style>
                body { text-align: center; font-family: sans-serif; padding: 20px; }
                img { max-width: 300px; margin-top: 20px; }
                h1 { font-size: 2em; }
            </style>
        </head>
        <body>
            <h1>${message}</h1>
            <img src="${imgUri}" />
        </body>
        </html>
    `;
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
