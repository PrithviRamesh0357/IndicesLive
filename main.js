const { app, BrowserWindow } = require("electron");
const path = require("path");
app.commandLine.appendSwitch("disable-gpu");

console.log("Current working directory:", process.cwd());

function createWindow() {
  //console.log("ENV:", process.env);

  //console.log("Current working directory:", process.cwd());
  const win = new BrowserWindow({
    width: 350,
    height: 300,
    frame: false, // To make it draggable,
    alwaysOnTop: true,
    resizable: true,
    transparent: false,
    webPreferences: {
      preload: path.join(__dirname, "electron", "preload.js"),
    },
  });

  console.log("Connecting to VITEE>>>");

  win.loadURL("http://localhost:5173").catch((err) => {
    console.error("Failed to load URL:", err);
  });
  //Debug activities
  win.webContents.openDevTools();

  win.webContents.on("did-fail-load", (event, errorCode, errorDescription) => {
    console.error(`Failed to load: ${errorDescription} (code: ${errorCode})`);
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
