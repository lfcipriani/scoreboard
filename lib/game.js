const Datastore = require("nedb")

class Game {
  constructor (schedule, filename = "") {
    this._setupSchedule(schedule)
    this._setupStorage(filename)
    this._scores = []
  }

  _setupSchedule (schedule) {
    this._start = schedule.start ? new Date(schedule.start).getTime() : null
    this._end = schedule.end ? new Date(schedule.end).getTime() : null

    this._startStr = schedule.start
    this._endStr = schedule.end
  }

  _setupStorage (filename) {
    this._scores = []
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
      value.key = key
      this._db.update(
        { key: key }, value, {}, (err) => {
          if (err) {
            reject(err)
            return
          }
          resolve()
        }
      )
    })
  }

  addScore (score) {
    this._scores.push(score)
  }

  async load () {
    let result = await this._fetch("game")
    if (!result) {
      result = { scores: this._scores.map(s => s.serialize()) }
      await this._set("game", result)
    }
    for (let score of this._scores) {
      for (let s of result.scores) {
        if (s.name === score.name) score.value = s.value
      }
      score.render()
    }
    return result
  }

  async save () {
    let data = { scores: this._scores.map(s => s.serialize()) }
    await this._update("game", data )
  }

  async reset () {
    let result = await this._fetch("game")
    for (let score of this._scores) {
      for (let s of result.scores) {
        if (s.name === score.name) {
          score.value = 0
        }
      }
      score.render()
    }
    await this.save()
  }

  currentState (now = null) {
    if (!this._start || !this._end) {
      return { state: "not_configured", countingDownTo: null }
    }
    if (!now) {
      now = new Date().getTime()
    }
    if (now < this._start) {
      return { state: "planned", countingDownTo: this._startStr }
    } else if (now >= this._start && now < this._end) {
      return { state: "ongoing", countingDownTo: this._endStr }
    } else {
      return { state: "finished", countingDownTo: null }
    }
  }
}

module.exports = Game
