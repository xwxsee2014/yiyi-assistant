const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  
  // Open DevTools in development mode
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC handlers for AI agent and MCP communication
ipcMain.handle('connect-mcp-server', async (event, serverConfig) => {
  try {
    const mcpClient = require('./src/mcp-client');
    return await mcpClient.connect(serverConfig);
  } catch (error) {
    console.error('Failed to connect to MCP server:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('process-user-request', async (event, { request, mcpServerConfig }) => {
  try {
    const aiAgent = require('./src/ai-agent');
    return await aiAgent.processRequest(request, mcpServerConfig);
  } catch (error) {
    console.error('AI agent error:', error);
    return { success: false, error: error.message };
  }
});
