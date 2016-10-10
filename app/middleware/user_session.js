const { isString } = require('lodash')
const crypto = require('crypto')

module.exports = (options, app) => {

  function* fetchUserInfo(loginToken, ctx) {
    if (!isString(loginToken)) throw new TypeError('loginToken must be a string.')

    const [ token, username ] = loginToken.split(':')

    if (encode(username) === token) {
      return yield ctx.service.users.getUserInfoByUsername(username)
    }
  }

  function encode(originWord) {
    const hmac = crypto.createHmac('sha256', app.config.passwordSecret)
    hmac.update(originWord)
    return hmac.digest('hex')
  }

  return function* (next) {
    // Check the user token in session store
    if (this.session.loginToken) {
      const user = yield fetchUserInfo(this.session.loginToken, this)

      this.user = user

      const isAdmin = yield this.service.administrators.checkAdministrator(user)

      const room = yield this.service.rooms.Room.findOne({ _host: user }).exec()
      const isHost = !!room

      if (isAdmin) this.user.isAdmin = isAdmin
      if (isHost) this.user.isHost = isHost

      yield next
    } else {
      yield next
      if (this.user) {
        this.session.loginToken = `${encode(this.user.username)}:${this.user.username}`
      }
    }
  }
}