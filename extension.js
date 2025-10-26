const vscode = require('vscode');
const cp = require('child_process');
const path = require('path');

function activate(context) {
  console.log('Happy Compiler: activate');

  let disposable =
      vscode.commands.registerCommand('happy-compiler.run', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showErrorMessage('Открой файл перед проверкой!');
          return;
        }

        // Сохраняем файл перед компиляцией
        const saved = await editor.document.save();
        if (!saved) {
          vscode.window.showErrorMessage('Сохраните файл перед компиляцией!');
          return;
        }

        const filePath = editor.document.fileName;
        const outPath = filePath + '.out';

        // Выбираем компилятор по расширению
        let compiler = 'gcc';
        if (filePath.endsWith('.cpp') || filePath.endsWith('.cc') ||
            filePath.endsWith('.cxx'))
          compiler = 'g++';

        // Полный командный вызов: -w подавляет предупреждения (опция при
        // необходимости)
        const cmd = `${compiler} -w "${filePath}" -o "${outPath}"`;

        console.log('Running compile command:', cmd);

        // Создаём Webview (панель для показа картинки)
        const panel = vscode.window.createWebviewPanel(
            'happyCompiler', 'Happy Compiler', vscode.ViewColumn.One, {
              enableScripts: true,
              localResourceRoots:
                  [vscode.Uri.joinPath(context.extensionUri, 'media')]
            });

        // Пути к картинкам
        const happyImg = panel.webview.asWebviewUri(
            vscode.Uri.joinPath(context.extensionUri, 'media', 'happy.png'));
        const sadImg = panel.webview.asWebviewUri(
            vscode.Uri.joinPath(context.extensionUri, 'media', 'sad.png'));

        // Запускаем компиляцию; stderr/stdout попадёт в переменные callback'а
        cp.exec(cmd, {timeout: 20000}, (err, stdout, stderr) => {
          console.log('Compile callback. err:', err);
          console.log('stdout:', stdout);
          console.log('stderr:', stderr);

          // err !== null означает ненулевой код выхода (ошибка компиляции или
          // компилятор не найден)
          if (err) {
            // Если компилятор не найден, в консоли будет ENOENT
            // Показываем грустную картинку без дополнительного текста
            panel.webview.html = makeHtml(sadImg, '😢 Компиляция не удалась');
          } else {
            panel.webview.html = makeHtml(happyImg, '🎉 Компиляция успешна');
          }
        });
      });

  context.subscriptions.push(disposable);
}

function makeHtml(imgUri, caption) {
  return `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { display:flex; flex-direction:column; align-items:center; justify-content:center;
                 font-family: sans-serif; padding:20px; background:#fff; color:#222; }
          h1 { margin: 0 0 10px 0; }
          img { max-width: 420px; max-height: 420px; border-radius:12px; box-shadow:0 8px 24px rgba(0,0,0,0.2); }
        </style>
      </head>
      <body>
        <h1>${caption}</h1>
        <img src="${imgUri}" alt="${caption}" />
      </body>
    </html>`;
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
