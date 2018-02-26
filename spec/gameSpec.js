const fs = require("fs")
const Game = require("../lib/game")
const Score = require("../lib/score")

describe("Game", () => {

  describe("State", () => {
    it("should load and save score of the game", async () => {
      let schedule = { start: "2018/02/25 01:00:00", end: "2018/02/25 02:00:00" }
      let game = new Game(schedule)
      let ta = new Score("totalA", 42)
      let tb = new Score("totalB", 13)
      game.addScore(ta)
      game.addScore(tb)

      let gameState = await game.load()
      expect(gameState.scores[0].name).toBe("totalA")
      expect(gameState.scores[1].name).toBe("totalB")
      expect(gameState.scores[0].value).toBe(42)
      expect(gameState.scores[1].value).toBe(13)
      expect(ta.value).toBe(42)
      expect(tb.value).toBe(13)

      ta.update(8)
      tb.update(7)
      await game.save()

      gameState = await game.load()
      expect(gameState.scores[0].name).toBe("totalA")
      expect(gameState.scores[1].name).toBe("totalB")
      expect(gameState.scores[0].value).toBe(50)
      expect(gameState.scores[1].value).toBe(20)
      expect(ta.value).toBe(50)
      expect(tb.value).toBe(20)
    })


    it("should load and save score of the game persisted on a file", async () => {
      let schedule = { start: "2018/02/25 01:00:00", end: "2018/02/25 02:00:00" }
      let game = new Game(schedule, "./temp-settings.db")
      let ta = new Score("totalA", 42)
      let tb = new Score("totalB", 13)
      game.addScore(ta)
      game.addScore(tb)

      let gameState = await game.load()
      expect(gameState.scores[0].name).toBe("totalA")
      expect(gameState.scores[1].name).toBe("totalB")
      expect(gameState.scores[0].value).toBe(42)
      expect(gameState.scores[1].value).toBe(13)
      expect(ta.value).toBe(42)
      expect(tb.value).toBe(13)

      ta.update(8)
      tb.update(7)
      await game.save()

      // reloading the game
      game = new Game(schedule, "./temp-settings.db")
      game.addScore(ta)
      game.addScore(tb)
      gameState = await game.load()

      expect(gameState.scores[0].name).toBe("totalA")
      expect(gameState.scores[1].name).toBe("totalB")
      expect(gameState.scores[0].value).toBe(50)
      expect(gameState.scores[1].value).toBe(20)
      expect(ta.value).toBe(50)
      expect(tb.value).toBe(20)

      try {
        fs.unlinkSync("./temp-settings.db")
      } catch (err) {
        expect(null).toBe("Temp db file not deleted.")
      }
    })
  })

  describe("Schedule", () => {
    it("should return 'not_configured' in case there's no settings", () => {
      let schedule = { start: null, end: null }
      let state = new Game(schedule)

      expect(state.currentState().state).toBe("not_configured")
      expect(state.currentState().countingDownTo).toBe(null)
    })

    it("should return 'planned' if current time < start time", () => {
      let schedule = { start: "2018/02/25 01:00:00", end: "2018/02/25 02:00:00" }
      let now = new Date("2018/02/25 00:30:00").getTime()
      let state = new Game(schedule)

      expect(state.currentState(now).state).toBe("planned")
      expect(state.currentState(now).countingDownTo).toBe("2018/02/25 01:00:00")

      now = new Date("2018/02/25 00:59:59").getTime()
      expect(state.currentState(now).state).toBe("planned")
      expect(state.currentState(now).countingDownTo).toBe("2018/02/25 01:00:00")
    })

    it("should return 'ongoing' if start time <= current time < end time", () => {
      let schedule = { start: "2018/02/25 01:00:00", end: "2018/02/25 02:00:00" }
      let now = new Date("2018/02/25 01:00:00").getTime()
      let state = new Game(schedule)

      expect(state.currentState(now).state).toBe("ongoing")
      expect(state.currentState(now).countingDownTo).toBe("2018/02/25 02:00:00")

      now = new Date("2018/02/25 01:59:59").getTime()
      expect(state.currentState(now).state).toBe("ongoing")
      expect(state.currentState(now).countingDownTo).toBe("2018/02/25 02:00:00")
    })

    it("should return 'finished' if current time > end time", () => {
      let schedule = { start: "2018/02/25 01:00:00", end: "2018/02/25 02:00:00" }
      let now = new Date("2018/02/25 02:00:00").getTime()
      let state = new Game(schedule)

      expect(state.currentState(now).state).toBe("finished")
      expect(state.currentState(now).countingDownTo).toBe(null)

      expect(state.currentState().state).toBe("finished")
      expect(state.currentState().countingDownTo).toBe(null)
    })
  })

})
