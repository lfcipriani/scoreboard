const Score = require("../lib/score")

describe("Score", () => {

  it("should return zero as default initial value", () => {
    let score = new Score("total")

    expect(score.name).toBe("total")
    expect(score.value).toBe(0)
  })

  it("should return the value if an initial value is provided", () => {
    let score = new Score("total", 42)

    expect(score.name).toBe("total")
    expect(score.value).toBe(42)
  })

  it("should update value", () => {
    let score = new Score("total")

    score.update(3)
    expect(score.value).toBe(3)
  })

  it("should update value negatively", () => {
    let score = new Score("total", 42)

    score.update(-5)
    expect(score.value).toBe(37)
  })

  it("will trigger render if callback is assigned", () => {
    let score = new Score("total")

    score.onRender((value) => {
      expect(value).toBe(3)
    })
    score.update(3)
  })

})
