const path = require("path")
const url = require("url")
require("dotenv").config()
const electron = require("electron")
const ipc = require("electron").ipcMain
const dialog = require("electron").dialog

const app = electron.app
const BrowserWindow = electron.BrowserWindow
const Menu = electron.Menu

let mainWindow
global.settingsPath = path.join(app.getPath("appData"),
  "scoreboard", process.env.SCOREBOARD_DB_SETTINGS)
global.gamePath = path.join(app.getPath("appData"),
  "scoreboard", process.env.SCOREBOARD_DB_GAME)
global.settingsPassword = process.env.SCOREBOARD_SETTINGS_PASSWORD

let template = [{
  label: "Sobre",
  submenu: [{
    label: "Código-fonte",
    click: () => {
      electron.shell.openExternal("https://github.com/lfcipriani/scoreboard")
    }
  }, {
    type: "separator"
  }, {
    label: "Rap da Maratona",
    click: () => {
      electron.shell.openExternal("https://soundcloud.com/lfcipriani/rap-da-maratona")
    }
  }, {
    label: "Concurso 3 pontos - Xylophone",
    click: () => {
      electron.shell.openExternal("https://soundcloud.com/lfcipriani/3pointcontest-xylophone")
    }
  }, {
    label: "Concurso 3 pontos - Coolbeat",
    click: () => {
      electron.shell.openExternal("https://soundcloud.com/lfcipriani/3pointcontest-coolbeat")
    }
  }]
  }, {
    label: "Janela",
    role: "window",
    submenu: [{
      label: "Minimize",
      accelerator: "CmdOrCtrl+M",
      role: "minimize"
    }, {
      label: "Close",
      accelerator: "CmdOrCtrl+W",
      role: "close"
    }, {
      type: "separator"
    }, {
      label: "Reopen Window",
      accelerator: "CmdOrCtrl+Shift+T",
      enabled: false,
      key: "reopenMenuItem",
      click: function () {
        app.emit("activate")
      }
    },{
      type: "separator"
    },{
      label: "Zoom In",
      accelerator: "CmdOrCtrl+Plus",
      role: "zoomin"
    },{
      label: "Zoom Out",
      accelerator: "CmdOrCtrl+-",
      role: "zoomout"
    },{
      label: "Zoom Reset",
      accelerator: "CmdOrCtrl+0",
      role: "resetzoom"
    },{
      type: "separator"
    },{
      label: 'Toggle Developer Tools',
      accelerator: (function () {
        if (process.platform === 'darwin') {
          return 'Alt+Command+I'
        } else {
          return 'Ctrl+Shift+I'
        }
      })(),
      click: function (item, focusedWindow) {
        if (focusedWindow) {
          focusedWindow.toggleDevTools()
        }
      }
    }]
}]

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1120,
    height: 720,
    icon: path.join(__dirname, "app/assets/icons/bballicon.png")
  })

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

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
