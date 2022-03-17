const schedule = require('node-schedule')
const debug = require('debug')('ip-store')

let allowedIpAddresses = []

schedule.scheduleJob('45 * * * *', () => {
  if (allowedIpAddresses.length === 0) return

  const now = new Date()
  const expiredIps = []

  allowedIpAddresses.forEach((item) => {
    if (now > item.expires) {
      expiredIps.push(item.ip)
    }
  })

  if (expiredIps.length === 0) return

  allowedIpAddresses = allowedIpAddresses.filter((item) => !expiredIps.includes(item.ip))

  debug('Allowed ip after cron job: %O', allowedIpAddresses)
})

class IpStoreService {
  /**
   * @param {string} ip
   */
  static saveAddress(ip) {
    if (!ip || typeof ip !== 'string') {
      return false
    }

    let existedIp
    if (allowedIpAddresses.length > 0) {
      existedIp = allowedIpAddresses.find((item) => item.ip === ip)
    }

    const now = new Date()

    if (existedIp) {
      debug('IP %s exists in allowed IP addresses', existedIp.ip)

      if (now > existedIp.expires) {
        debug('Now > expires. Delete expired IP item')
        allowedIpAddresses = allowedIpAddresses.filter((item) => item.ip !== ip)
      }

      const diff = (existedIp.expires - now) / 1000

      debug('Diff: %O', diff)

      if (diff > 7) return

      const prolongation = 7 - diff

      debug('Prolongate IP %s', existedIp.ip)
      debug('to %O', existedIp.expires)
      debug('Allowed IPs after prolongation: %O', allowedIpAddresses)

      existedIp.expires = new Date(existedIp.expires.setSeconds(existedIp.expires.getSeconds() + prolongation))

      return
    }

    const seconds = now.setSeconds(now.getSeconds() + 7)

    const ipItem = {
      ip,
      expires: new Date(seconds),
    }

    debug('Add new ip: %s', ip)
    allowedIpAddresses.push(ipItem)
    debug('Allowed IPs after add new one: %O', allowedIpAddresses)

    return ip
  }

  /**
   * Checks is IP address allowed
   * @return {boolean}
   * @param {string} ip
   */
  static isAllowedIp(ip) {
    if (!ip || typeof ip !== 'string') {
      return false
    }

    debug('Allowed IPs: %O', allowedIpAddresses)
    debug('Provided IP: %O', ip)

    const ipItem = allowedIpAddresses.find((item) => item.ip === ip)

    if (!ipItem) return false

    const isExpired = ipItem.expires < new Date()

    if (isExpired) {
      debug('Expired IP: %s', ip)
      allowedIpAddresses = allowedIpAddresses.filter((item) => item.ip !== ip)
    }

    return !isExpired
  }
}

module.exports = IpStoreService
