const Score = require("../lib/score")

let jqElement = {
  text (v) {
    return v
  }
}

describe("Score", () => {

  it("mocks jquery element for testing", () => {
    expect(jqElement.text(3)).toBe(3)
  })

  it("should return zero as default initial value", () => {
    let score = new Score(jqElement)

    expect(score.value).toBe(0)
  })

  it("should increment point properly", () => {
    let score = new Score(jqElement)

    score.doIt(1)
    expect(score.value).toBe(1)
    score.doIt(2)
    expect(score.value).toBe(3)
    score.doIt(3)
    expect(score.value).toBe(6)
  })

  it("should decrement point properly", () => {
    let score = new Score(jqElement)

    score.doIt(6)
    expect(score.value).toBe(6)
    score.undo(3)
    expect(score.value).toBe(3)
    score.undo(2)
    expect(score.value).toBe(1)
  })
})
