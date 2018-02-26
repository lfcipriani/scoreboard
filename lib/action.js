class Action {
  constructor (name, increment) {
    this._name = name
    this._increment = increment
    this._decrement = (-1) * increment
    this._subscribers = []
  }

  addSubscriber (subscriber) {
    this._subscribers.push(subscriber)
  }

  trigger (increment = true) {
    let number = increment ? this._increment : this._decrement
    for (let score of this._subscribers) {
      score.update(number)
    }
    return number
  }

}

module.exports = Action
