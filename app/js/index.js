/*global SegmentDisplay*/

const remote = require("electron").remote
const ipc = require("electron").ipcRenderer
const Settings = require("../lib/settings")
const Game = require("../lib/game")
const Score = require("../lib/score")
const Action = require("../lib/action")

$(() => {
  $("#sb-loading").toggleClass("active", true)

  let settings = new Settings(remote.getGlobal("settingsPath"))
  let game     = null

  // utilities
  function pad (num, size, base = "000000000"){
    return (base + num).substr(-size)
  }

  // setup initial UI
  function sevenSegment (element, pattern, colorOn, colorOff, opt = {}) {
    let disp = new SegmentDisplay(element)
    disp.pattern         = pattern //"###:##:##"
    disp.displayAngle    = opt.displayAngle || 6
    disp.digitHeight     = opt.digitHeight || 20
    disp.digitWidth      = opt.digitWidth || 14
    disp.digitDistance   = opt.digitDistance || 2.5
    disp.segmentWidth    = opt.segmentWidth || 2
    disp.segmentDistance = opt.segmentDistance || 0.3
    disp.segmentCount    = opt.segmentCount || 7 //7, 14 or 16
    disp.cornerType      = 3
    disp.colorOn         = colorOn //"#e95d0f"
    disp.colorOff        = colorOff //"#4b1e05"
    return disp
  }

  function showMessage(msg, type = "positive") {
    $("#sb-message p").text(msg)
    $("#sb-message")
      .toggleClass(type, true)
      .transition({
        animation: "fade"
      })
      .transition({
        animation: "fade",
        interval: 5000,
        onComplete: () => {
          $("#sb-message").toggleClass(type, false)
        }
      })
  }

  let displayCountdown = sevenSegment("sb-countdown-canvas", "##:##:##", "#e95d0f", "#4b1e05")//"#401900")
  displayCountdown.draw()
  let displayScores = {
    teama: sevenSegment("sb-team-a-score-total", "####", "#e95d0f", "#4b1e05"),
    teamb: sevenSegment("sb-team-b-score-total", "####", "#e95d0f", "#4b1e05")
  }
  displayScores["teama"].draw()
  displayScores["teamb"].draw()

  function setupGame (settings, jqElement, onStateChange) {
    $("#sb-settings-btn").find("div.label").hide()
    settings.schedule()
      .then((s) => {
        game = new Game(s, remote.getGlobal("gamePath"))
        setupActionsAndScores()
        let now = game.currentState()
        if (now.state === "not_configured" || now.state === "finished") {
          onStateChange({state: now.state})
        } else {
          jqElement.countdown(now.countingDownTo)
            .on("update.countdown", (event) => {
              event.state = now.state
              onStateChange(event)
            })
            .on("finish.countdown", () => {
              setupGame(settings, jqElement, onStateChange)
            })
        }
        $("#sb-loading").toggleClass("active", false)
      })
    settings.teams()
      .then((t) => {
        $("#sb-team-a-name").text(t.teamA.name)
        $("#sb-undo-team-a").text(t.teamA.name)
        $("#sb-team-b-name").text(t.teamB.name)
        $("#sb-undo-team-b").text(t.teamB.name)
      })
  }

  function setupActionsAndScores () {
    let teams = ["a", "b"]
    for (let t of teams) {
      let teamScore = new Score(`score_${t}`, 0)
      game.addScore(teamScore)

      for (let i = 1; i <= 3; i++) {
        let teamAction = new Action(`points_${t}_${i}`, i)
        $(`#sb-team-${t}-action-${i}`).click(
          () => {
            $(`#sb-team-${t}-action-${i}`).transition("pulse",250)
            teamAction.trigger()
          }
        )
        if (i === 1) {
          // setup undo
          $(`#sb-undo-team-${t}-plus`).click(() => teamAction.trigger())
          $(`#sb-undo-team-${t}-minus`).click(() => teamAction.trigger(false))
        }
        teamAction.addSubscriber(teamScore)
      }

      teamScore.onRender((value) => {
        game.save()
        displayScores[`team${t}`].setValue(`${pad(value, 4, "    ")}`)
        $(`#sb-undo-team-${t}-score`).text(value)
      })
    }
    game.load()
  }

  function scheduleStateChange (event) {
    switch (event.state) {
    case "planned":
      displayCountdown.setValue(event.strftime("%I:%M:%S"))
      $("#sb-countdown").text(event.strftime("%I:%M:%S"))
      break
    case "ongoing":
      displayCountdown.setValue(event.strftime("%I:%M:%S"))
      $("#sb-countdown").text(event.strftime("%I:%M:%S"))
      break
    case "finished":
      displayCountdown.setValue("00:00:00")
      $("#sb-countdown").text("GAME OVER!")
      break
    default:
      $("#sb-settings-btn").find("div.label").show()
      displayCountdown.setValue("00:00:00")
      $("#sb-countdown").text("NO GAME YET")
    }
  }

  // setup game
  setupGame(settings, $("#sb-countdown"), scheduleStateChange)

  // setup settings
  $("#sb-settings-schedule-start").calendar({
    minDate: new Date(),
    endCalendar: $("#sb-settings-schedule-end"),
    ampm: false,
    disableMinute: true,
    formatter: {
      datetime: function (date) {
        if (!date) return ""
        let day = pad(date.getDate(), 2)
        let month = pad(date.getMonth() + 1, 2)
        let year = date.getFullYear()
        let hours = pad(date.getHours(), 2)
        let minutes = pad(date.getMinutes(), 2)
        let seconds = pad(date.getSeconds(), 2)
        return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`
      }
    }
  })
  $("#sb-settings-schedule-end").calendar({
    startCalendar: $("#sb-settings-schedule-start"),
    ampm: false,
    disableMinute: true,
    formatter: {
      datetime: function (date) {
        if (!date) return ""
        let day = pad(date.getDate(), 2)
        let month = pad(date.getMonth() + 1, 2)
        let year = date.getFullYear()
        let hours = pad(date.getHours(), 2)
        let minutes = pad(date.getMinutes(), 2)
        let seconds = pad(date.getSeconds(), 2)
        return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`
      }
    }
  })

  $("#sb-settings-btn").click(async () => {
    let t = await settings.teams()
    $("#sb-settings-team-a-name").val(t.teamA.name)
    $("#sb-settings-team-b-name").val(t.teamB.name)
    $("#sb-settings-team-a-logo").val(t.teamA.logo)
    $("#sb-settings-team-b-logo").val(t.teamB.logo)

    let s = await settings.schedule()
    $("#sb-settings-schedule-start").calendar("set date", s.start ? new Date(s.start) : null )
    $("#sb-settings-schedule-end").calendar("set date", s.end ? new Date(s.end) : null )

    $(".ui.sidebar").sidebar("show")
  })

  $("#sb-settings-restart-btn").click(() => {
    let validation = new Map()
    validation.set("#sb-settings-team-a-name", $("#sb-settings-team-a-name").val())
    validation.set("#sb-settings-team-b-name", $("#sb-settings-team-b-name").val())
    // validation.set("#sb-settings-team-a-logo", $("#sb-settings-team-a-logo").val())
    // validation.set("#sb-settings-team-b-logo", $("#sb-settings-team-b-logo").val())
    validation.set("#sb-settings-schedule-start input", $("#sb-settings-schedule-start input").val())
    validation.set("#sb-settings-schedule-end input", $("#sb-settings-schedule-end input").val())

    let valid = true
    for (let [ key, val ] of validation.entries()) {
      if (!val) {
        valid = false
        $(key).parents("div.field").toggleClass("error", true)
      } else {
        $(key).parents("div.field").toggleClass("error", false)
      }
    }

    if (valid) {
      $("#sb-password-input").val("")
      $("#sb-password-modal")
        .modal({
          closable: false,
          onDeny: () => {
            // cancel
          },
          onApprove: async () => {
            if ($("#sb-password-input").val() === remote.getGlobal("settingsPassword")) {
              $("#sb-loading").toggleClass("active", true)
              await settings.setTeams({
                teamA: { name: validation.get("#sb-settings-team-a-name"), logo: validation.get("#sb-settings-team-a-logo") },
                teamB: { name: validation.get("#sb-settings-team-b-name"), logo: validation.get("#sb-settings-team-b-logo") }
              })
              await settings.setSchedule(
                validation.get("#sb-settings-schedule-start input"),
                validation.get("#sb-settings-schedule-end input")
              )
              await game.reset()
              setupGame(settings, $("#sb-countdown"), scheduleStateChange)
              //TODO: load images $("#testing-images").attr("src", `file:///${$("#sb-settings-team-b-logo").val()}`)
              showMessage("Let the new game begin!", "positive")
            } else {
              showMessage("Wrong password!", "negative")
            }
          }
        })
        .modal("show")

      $(".ui.sidebar").sidebar("hide")
    }
  })

  $("#sb-settings-cancel-btn").click(() => {
    $(".ui.sidebar").sidebar("hide")
  })

  $("#sb-undo-btn").click(() => {
    $("#sb-undo-modal")
      .modal({
        closable: false,
        onApprove: () => {
          // just close
        }
      }).modal("show")
  })

  $("#sb-settings-team-a-logo-btn").click(() => {
    ipc.send("open-file-dialog", "#sb-settings-team-a-logo")
  })
  $("#sb-settings-team-b-logo-btn").click(() => {
    ipc.send("open-file-dialog", "#sb-settings-team-b-logo")
  })
  ipc.on("selected-file", function (event, arg) {
    $(arg.element).val(arg.files[0])
  })
})
