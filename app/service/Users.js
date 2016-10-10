const crypto = require('crypto')

module.exports = app => {

  // User Schema
  const User = app.mongo.model('User', {
    username: {
      type: String,
      unique: true
    },
    nickname: String,
    password: String,
    avatar: {
      type: String,
      default: app.config.defaultAvatar
    },
    description: {
      type: String,
      default: app.config.defaultBroadcastRoom.description
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  })

  /**
   * @class Users Service
   */
  class Users extends app.Service {
    constructor(ctx) {
      super(ctx)

       this.User = User
    }

    /**
     * Create new user
     *
     * @param {String} username user's username @unique
     * @param {String} nickname user's nickname
     * @param {String} password user's password
     * @param {String} description user's personal description
     *
     * @returns {User} user object
     * @returns {String} user's id
     */
    * createUser(username, nickname, password, description = defaultDesc) {
      const user = new User({
        username, nickname, description,
        password: encodePassword(password)
      })

      yield user.save()

      return {
        user,
        id: user._id
      }
    }

    /**
     * Get user's info by id
     *
     * @param {String} id User's id
     *
     * @return {User} user object
     */
    * getUserInfoById(id) {
      try {
        const user = yield User.findById(id).exec()

        return user
      } catch(e) {
        throw new Error('User not found.')
      }
    }

    /**
     * Get user's info by username
     *
     * @param {String} username User's username
     *
     * @return {User} user object
     */
    * getUserInfoByUsername(username) {
      try {
        const user = yield User.findOne({ username }).exec()

        return user
      } catch(e) {
        throw new Error('User not found.')
      }
    }

    /**
     * Validate operation permission
     *
     * @param {String} username User's username
     * @param {String} password Password
     *
     * @return {Boolean} validate result
     */
    * validateUser(username, password) {
      const user = yield this.getUserInfoByUsername(username)

      return encodePassword(password) === user.password
    }

    /**
     * Update user's nickname
     *
     * @param {String} username User's username
     * @param {String} nickname New nickname
     * @param {String} password Password
     *
     * @return {Number} operation result
     */
    * updateNickname(username, nickname, password, authed = false) {
      if (!authed) {
        const validated = yield this.validateUser(username, password)

        if (!validated) {
          throw new Error('Password not correct.')
        }
      }

      const user = yield this.getUserInfoByUsername(username)
      user.nickname = nickname

      try {
        yield user.save()

        return app.CODES.SUCCESS
      } catch(err) {
        app.logger.error(err)
        return app.CODES.FAILED
      }
    }

    /**
     * Update user's description
     *
     * @param {String} username User's username
     * @param {String} description New description
     * @param {String} password Password
     *
     * @return {Number} operation result
     */
    * updateDescription(username, description = defaultDesc, password, authed = false) {
      if (!authed) {
        const validated = yield this.validateUser(username, password)

        if (!validated) {
          throw new Error('Password not correct.')
        }
      }

      const user = yield this.getUserInfoByUsername(username)
      user.description = description

      try {
        yield user.save()

        return app.CODES.SUCCESS
      } catch(err) {
        app.logger.error(err)
        return app.CODES.FAILED
      }
    }

    /**
     * Update user's avatar
     *
     * @param {String} username User's username
     * @param {String} avatar New avatar url
     * @param {String} password Password
     *
     * @return {Number} operation result
     */
    * updateAvatar(username, avatar, password, authed = false) {
      if (!authed) {
        const validated = yield this.validateUser(username, password)

        if (!validated) {
          throw new Error('Password not correct.')
        }
      }

      const user = yield this.getUserInfoByUsername(username)
      user.avatar = avatar

      try {
        yield user.save()

        return app.CODES.SUCCESS
      } catch(err) {
        app.logger.error(err)
        throw err
      }
    }

    /**
     * Update user's password
     *
     * @param {String} username User's username
     * @param {String} newPassword New password
     * @param {String} oldPassword Old password
     *
     * @return {Number} operation result
     */
    * updatePassword(username, newPassword, oldPassword, authed = false) {
      if (!authed) {
        const validated = yield this.validateUser(username, oldPassword)

        if (!validated) {
          throw new Error('Password not correct.')
        }
      }

      const user = yield this.getUserInfoByUsername(username)
      user.password = encodePassword(newPassword)

      try {
        yield user.save()

        return app.CODES.SUCCESS
      } catch(err) {
        app.logger.error(err)
        return app.CODES.FAILED
      }
    }
  }

  return Users

  function encodePassword(originWord) {
    const hmac = crypto.createHmac('sha256', app.config.passwordSecret)
    hmac.update(originWord)
    return hmac.digest('hex')
  }
}