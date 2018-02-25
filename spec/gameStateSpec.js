const GameState = require("../lib/gameState")

describe("GameState", () => {

  it("should return 'not_configured' in case there's no settings", () => {
    let schedule = { start: null, end: null }
    let state = new GameState(schedule)

    expect(state.current().state).toBe("not_configured")
    expect(state.current().countingDownTo).toBe(null)
  })

  it("should return 'planned' if current time < start time", () => {
    let schedule = { start: "2018/02/25 01:00:00", end: "2018/02/25 02:00:00" }
    let now = new Date("2018/02/25 00:30:00").getTime()
    let state = new GameState(schedule)

    expect(state.current(now).state).toBe("planned")
    expect(state.current(now).countingDownTo).toBe("2018/02/25 01:00:00")

    now = new Date("2018/02/25 00:59:59").getTime()
    expect(state.current(now).state).toBe("planned")
    expect(state.current(now).countingDownTo).toBe("2018/02/25 01:00:00")
  })

  it("should return 'ongoing' if start time <= current time < end time", () => {
    let schedule = { start: "2018/02/25 01:00:00", end: "2018/02/25 02:00:00" }
    let now = new Date("2018/02/25 01:00:00").getTime()
    let state = new GameState(schedule)

    expect(state.current(now).state).toBe("ongoing")
    expect(state.current(now).countingDownTo).toBe("2018/02/25 02:00:00")

    now = new Date("2018/02/25 01:59:59").getTime()
    expect(state.current(now).state).toBe("ongoing")
    expect(state.current(now).countingDownTo).toBe("2018/02/25 02:00:00")
  })

  it("should return 'finished' if current time > end time", () => {
    let schedule = { start: "2018/02/25 01:00:00", end: "2018/02/25 02:00:00" }
    let now = new Date("2018/02/25 02:00:00").getTime()
    let state = new GameState(schedule)

    expect(state.current(now).state).toBe("finished")
    expect(state.current(now).countingDownTo).toBe(null)

    expect(state.current().state).toBe("finished")
    expect(state.current().countingDownTo).toBe(null)
  })
})
