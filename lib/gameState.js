class GameState {
  constructor (schedule) {
    this._start = schedule.start ? new Date(schedule.start).getTime() : null
    this._end = schedule.end ? new Date(schedule.end).getTime() : null

    this._startStr = schedule.start
    this._endStr = schedule.end
  }

  current (now = null) {
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

module.exports = GameState
