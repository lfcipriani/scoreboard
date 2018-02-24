const Datastore = require("nedb")

class Settings {
  constructor (filename = "") {
    let options = {
      autoload: true
    }
    if (filename !== "") {
      options.filename = filename
    }
    this._db = new Datastore(options)
  }

  _fetch (key) {
    return new Promise((resolve, reject) => {
      this._db.findOne({ key: key }, (err, doc) => {
        if (err) {
          reject(err)
          return
        }
        if (!doc) { resolve(null) }
        else { resolve(doc) }
      })
    })
  }

  _set (key, value) {
    return new Promise((resolve, reject) => {
      value.key = key
      this._db.insert(value, (err, newDoc) => {
        if (err) {
          reject(err)
          return
        }
        resolve(newDoc)
      })
    })
  }

  _update (key, value) {
    return new Promise((resolve, reject) => {
      this._db.update(
        { key: key },
        { $set: value },
        {}, (err) => {
          if (err) {
            reject(err)
            return
          }
          resolve()
        }
      )
    })
  }

  async schedule () {
    let result = await this._fetch("schedule")
    if (!result) {
      result = await this._set("schedule", { start: null, end: null } )
    }
    return {
      start: result.start,
      end: result.end
    }
  }

  async setSchedule (scheduleStart, scheduleEnd) {
    let data = { start: scheduleStart, end: scheduleEnd }
    let result = await this._fetch("schedule")
    if (!result) {
      await this._set("schedule", data)
    } else {
      await this._update("schedule", data )
    }
  }

}

module.exports = Settings
