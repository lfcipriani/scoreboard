const fs = require("fs")
const Settings = require("../lib/settings")

describe("Settings", () => {

  describe("Schedule", () => {
    it("should have empty schedule by default", async () => {
      let settings = new Settings()
      let result = await settings.schedule()

      expect(result.start).toBe(null)
      expect(result.end).toBe(null)
    })

    it("should set a date range as schedule", async () => {
      let settings = new Settings()
      await settings.setSchedule("2018/02/24 19:45:00", "2018/02/25 20:13:00")
      let result = await settings.schedule()

      expect(result.start).toBe("2018/02/24 19:45:00")
      expect(result.end).toBe("2018/02/25 20:13:00")
    })

    it("should save on a file if filename is set", async () => {
      let settings = new Settings("./temp-settings.db")
      await settings.setSchedule("2018/02/24 19:45:00", "2018/02/25 20:13:00")
      let result = await settings.schedule()

      expect(result.start).toBe("2018/02/24 19:45:00")
      expect(result.end).toBe("2018/02/25 20:13:00")

      try {
        fs.unlinkSync("./temp-settings.db")
      } catch (err) {
        expect(null).toBe("Temp db file not deleted.")
      }
    })
  })

  describe("Teams", () => {
    it("should have default names and no logo", async () => {
      let settings = new Settings()
      let result = await settings.teams()

      expect(result.teamA.name).toBe("Nicks")
      expect(result.teamA.logo).toBe(null)
      expect(result.teamB.name).toBe("Cavaliers")
      expect(result.teamB.logo).toBe(null)
    })

    it("should be able to set names logos", async () => {
      let teams = {
        teamA: { name: "Bulls", logo: "bulls.jpg" },
        teamB: { name: "Hawks", logo: null }
      }
      let settings = new Settings()
      await settings.setTeams(teams)
      let result = await settings.teams()

      expect(result.teamA.name).toBe("Bulls")
      expect(result.teamA.logo).toBe("bulls.jpg")
      expect(result.teamB.name).toBe("Hawks")
      expect(result.teamB.logo).toBe(null)
    })
  })

})
