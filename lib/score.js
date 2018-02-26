class Score {
  constructor (name, initialValue = 0) {
    this.name = name
    this.value = initialValue
    this._render = null
  }

  onRender (callback) {
    this._render = callback
  }

  render () {
    if (this._render) this._render(this.value)
  }

  update (value) {
    this.value += value
    this.render()
  }

  serialize () {
    return {
      name: this.name,
      value: this.value
    }
  }
}

module.exports = Score
