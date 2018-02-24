const Score = require("../lib/score")

$(function() {
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
