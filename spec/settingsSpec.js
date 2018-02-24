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
      await settings.setSchedule("2018-02-24 19:45", "2018-02-25 20:13")
      let result = await settings.schedule()

      expect(result.start).toBe("2018-02-24 19:45")
      expect(result.end).toBe("2018-02-25 20:13")
    })

    it("should save on a file if filename is set", async () => {
      let settings = new Settings("./temp-settings.db")
      await settings.setSchedule("2018-02-24 19:45", "2018-02-25 20:13")
      let result = await settings.schedule()

      expect(result.start).toBe("2018-02-24 19:45")
      expect(result.end).toBe("2018-02-25 20:13")

      try {
        fs.unlinkSync("./temp-settings.db")
      } catch (err) {
        expect(null).toBe("Temp db file not deleted.")
      }
    })
  })

})
