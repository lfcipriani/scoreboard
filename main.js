const path = require("path")
const url = require("url")
require("dotenv").config()
const electron = require("electron")
const ipc = require("electron").ipcMain
const dialog = require("electron").dialog

const app = electron.app
const BrowserWindow = electron.BrowserWindow

let mainWindow
global.settingsPath = path.join(app.getPath("appData"),
  "scoreboard", process.env.SCOREBOARD_DB_SETTINGS)
global.gamePath = path.join(app.getPath("appData"),
  "scoreboard", process.env.SCOREBOARD_DB_GAME)
global.settingsPassword = process.env.SCOREBOARD_SETTINGS_PASSWORD

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1120,
    height: 700
  })

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, "app/index.html"),
    protocol: "file:",
    slashes: true
  }))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  mainWindow.on("closed", function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow)

ipc.on("open-file-dialog", function (event, element) {
  dialog.showOpenDialog({
    properties: ["openFile"]
  }, (files) => {
    if (files) event.sender.send("selected-file", { files: files, element: element})
  })
})

// app.on("window-all-closed", function () {
//   // On OS X it is common for applications and their menu bar
//   // to stay active until the user quits explicitly with Cmd + Q
//   if (process.platform !== "darwin") {
//     app.quit()
//   }
// })
//
// app.on("activate", function () {
//   // On OS X it's common to re-create a window in the app when the
//   // dock icon is clicked and there are no other windows open.
//   if (mainWindow === null) {
//     createWindow()
//   }
// })

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
