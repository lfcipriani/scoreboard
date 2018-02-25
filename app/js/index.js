const remote = require("electron").remote
const Score = require("../lib/score")
const Settings = require("../lib/settings")
const GameState = require("../lib/gameState")

$(() => {
  let settings = new Settings(remote.getGlobal("settingsPath"))

  function setupSchedule (settings, jqElement, onStateChange) {
    settings.schedule()
      .then((s) => {
        // { start: "2018/02/26 18:00:00", end: "2018/02/26 18:00:00" }
        s = { start: null, end: null }
        let now = new GameState(s).current()
        if (now.state === "not_configured" || now.state === "finished") {
          onStateChange({state: now.state})
        } else {
          jqElement.countdown(now.countingDownTo)
            .on("update.countdown", (event) => {
              event.state = now.state
              onStateChange(event)
            })
            .on("finish.countdown", () => {
              setupSchedule(settings, jqElement, onStateChange)
            })
        }
      })
  }

  setupSchedule(settings, $("#sb-countdown"),
    (event) => {
      switch (event.state) {
      case "planned":
        $("#sb-countdown").text(event.strftime("%I:%M:%S"))
        break
      case "ongoing":
        $("#sb-countdown").text(event.strftime("%I:%M:%S"))
        break
      case "finished":
        $("#sb-countdown").text("GAME OVER!")
        break
      default:
        $("#sb-countdown").text("NO GAME YET")
      }
    }
  )

  settings.teams()
    .then((t) => {
      $("#sb-team-a-name").text(t.teamA.name)
      $("#sb-team-b-name").text(t.teamB.name)
    })

  let teams = ["a", "b"]

  for (let t of teams) {
    let teamScore = new Score($(`#sb-team-${t}-score-total`))
    for (let i = 1; i <= 3; i++) {
      $(`#sb-team-${t}-action-${i}`).click(
        () => teamScore.doIt(i)
      )
    }
  }
})
