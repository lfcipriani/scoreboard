const Score = require("../lib/score")
const Action = require("../lib/action")

describe("Action", () => {

  it("should work fine even when there's no subscribers", () => {
    let action = new Action("3 points", 3)

    expect(action.trigger()).toBe(3)
  })

  it("should accept subscribers that are notified about updates", () => {
    let action = new Action("3 points", 3)
    let total = new Score("Total", 5)
    let threePoints = new Score("Total 3 points", 8)

    action.addSubscriber(total)
    action.addSubscriber(threePoints)
    expect(action.trigger()).toBe(3)
    expect(total.value).toBe(8)
    expect(threePoints.value).toBe(11)
  })

  it("should decrement if triggered with false", () => {
    let action = new Action("3 points", 3)
    let total = new Score("Total", 5)

    action.addSubscriber(total)
    expect(action.trigger(false)).toBe(-3)
    expect(total.value).toBe(2)
  })
})
