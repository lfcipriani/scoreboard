/*global SegmentDisplay*/

const remote = require("electron").remote
const ipc = require("electron").ipcRenderer
const Settings = require("../lib/settings")
const Game = require("../lib/game")
const Score = require("../lib/score")
const Action = require("../lib/action")

$(() => {
  let settings = new Settings(remote.getGlobal("settingsPath"))
  let game     = null

  let displayCountdown = new SegmentDisplay("sb-countdown-canvas")
  displayCountdown.pattern         = "###:##:##"
  displayCountdown.displayAngle    = 6
  displayCountdown.digitHeight     = 20
  displayCountdown.digitWidth      = 14
  displayCountdown.digitDistance   = 2.5
  displayCountdown.segmentWidth    = 2
  displayCountdown.segmentDistance = 0.3
  displayCountdown.segmentCount    = 7
  displayCountdown.cornerType      = 3
  displayCountdown.colorOn         = "#e95d0f"
  displayCountdown.colorOff        = "#4b1e05"
  displayCountdown.draw()

  function pad (num, size){
    return ("000000000" + num).substr(-size)
  }

  function setupGame (settings, jqElement, onStateChange) {
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
      })
    settings.teams()
      .then((t) => {
        $("#sb-team-a-name").text(t.teamA.name)
        $("#sb-team-b-name").text(t.teamB.name)
      })
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

  function setupActionsAndScores () {
    let teams = ["a", "b"]
    for (let t of teams) {
      let teamScore = new Score(`score_${t}`, 0)
      game.addScore(teamScore)
      for (let i = 1; i <= 3; i++) {
        let teamAction = new Action(`points_${t}_${i}`, i)
        $(`#sb-team-${t}-action-${i}`).click(
          () => teamAction.trigger()
        )
        teamAction.addSubscriber(teamScore)
      }
      teamScore.onRender((value) => {
        game.save()
        $(`#sb-team-${t}-score-total`).text(value)
      })
    }
    game.load()
  }

  $("#sb-settings-btn").find("div.label").hide()
  setupGame(settings, $("#sb-countdown"), scheduleStateChange)

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

  $("#sb-settings-restart-btn").click(async () => {
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
      let teams = {
        teamA: { name: validation.get("#sb-settings-team-a-name"), logo: validation.get("#sb-settings-team-a-logo") },
        teamB: { name: validation.get("#sb-settings-team-b-name"), logo: validation.get("#sb-settings-team-b-logo") }
      }
      await settings.setTeams(teams)
      await settings.setSchedule(
        validation.get("#sb-settings-schedule-start input"),
        validation.get("#sb-settings-schedule-end input")
      )
      setupGame(settings, $("#sb-countdown"), scheduleStateChange)
      $("#testing-images").attr("src", `file:///${$("#sb-settings-team-b-logo").val()}`)
      $("#sb-settings-btn").find("div.label").hide()
      $(".ui.sidebar").sidebar("hide")
    }
  })

  $("#sb-settings-cancel-btn").click(() => {
    $(".ui.sidebar").sidebar("hide")
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
