const { app, BrowserWindow, shell, protocol } = require('electron');
const path = require('path');
const fs = require('fs');

/* 用自定义 app:// 协议加载页面，使 fetch('words.json') 可用（file:// 下 fetch 会被浏览器拦截）。
   必须在 app ready 之前注册 scheme 权限。 */
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } }
]);

/* 打包后页面与词库位于应用目录；本地调试时引用仓库根目录产物，避免维护副本 */
const ROOT = app.isPackaged ? __dirname : path.join(__dirname, '..');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function registerAppProtocol() {
  protocol.handle('app', async (req) => {
    let rel = decodeURIComponent(new URL(req.url).pathname);
    if (rel === '/' || rel === '') rel = '/index.html';
    const filePath = path.normalize(path.join(ROOT, rel));
    if (!filePath.startsWith(ROOT)) return new Response('Forbidden', { status: 403 });
    try {
      const data = await fs.promises.readFile(filePath);
      return new Response(data, {
        headers: { 'content-type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream' }
      });
    } catch (e) {
      return new Response('Not Found', { status: 404 });
    }
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 520,
    height: 900,
    minWidth: 380,
    minHeight: 600,
    backgroundColor: '#090a0d',
    autoHideMenuBar: true,
    title: 'WORDS',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.loadURL('app://words/index.html');
  /* 外链（如 Releases 页）改用系统浏览器打开 */
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  registerAppProtocol();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
