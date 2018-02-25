const remote = require("electron").remote
const Score = require("../lib/score")
const Settings = require("../lib/settings")

$(function() {
  let settings = new Settings(remote.getGlobal("settingsPath"))

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
