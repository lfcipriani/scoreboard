class GameState {
  constructor (schedule) {
    this._start = schedule.start ? new Date(schedule.start).getTime() : null
    this._end = schedule.end ? new Date(schedule.end).getTime() : null
  }

  current (now = null) {
    if (!this._start || !this._end) {
      return "not_configured"
    }
    if (!now) {
      now = new Date().getTime()
    }
    if (now < this._start) {
      return "planned"
    } else if (now >= this._start && now < this._end) {
      return "ongoing"
    } else {
      return "finished"
    }
  }
}

module.exports = GameState
