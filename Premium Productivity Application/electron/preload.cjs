const { contextBridge } = require("electron");

// Expose minimal API to the renderer
contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
  platform: process.platform,
});
