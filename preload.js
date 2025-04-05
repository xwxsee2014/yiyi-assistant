const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  connectToMcpServer: (serverConfig) => {
    return ipcRenderer.invoke('connect-mcp-server', serverConfig);
  },
  
  processUserRequest: (request, mcpServerConfig) => {
    return ipcRenderer.invoke('process-user-request', { request, mcpServerConfig });
  }
});
