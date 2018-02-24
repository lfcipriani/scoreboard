class Score {
  constructor (element, initialValue = 0) {
    this.element = element
    this.value = initialValue
    this.render()
  }

  doIt (value) {
    this.value += value
    this.render()
  }

  undo (value) {
    this.value -= value
    this.render()
  }

  render () {
    this.element.text(this.value)
  }
}

module.exports = Score
