const uuid = require('uuid')
const debug = require('debug')('static-key')

let keys = []

class StaticKey {
  static createKey() {
    const key = uuid.v4()

    keys.push(key)
    debug('Add new key: %s', key)

    setTimeout(() => {
      keys = keys.filter(k => k !== key)
      debug('Expired key: %s', key)
    }, 9000)

    return key
  }

  /**
   * @return {boolean}
   * @param {string} key
   */
  static isKeyValid(key) {
    debug('Validate key: %s', key)

    if (!key) return false

    debug('Keys: %O', keys)

    debug('Success validate key. Return: %O', keys.find(k => k === key))

    return !!keys.find(k => k === key)
  }
}

module.exports = StaticKey
