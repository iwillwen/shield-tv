/**
 * Users API
 */
const fs = require('fs')
const path = require('path')

// routing: POST /api/v1/users
exports.create = function* createUser() {
  const userInfo = this.request.body

  const { user, id } = yield this.service.users.createUser(
    userInfo.username, userInfo.nickname, userInfo.password, userInfo.description
  )

  this.body = {
    user: {
      id,
      username: user.username,
      nickname: user.nickname,
      description: user.description,
      avatar: user.avatar
    }
  }
}

// routing: GET /api/v1/users/:username
exports.show = function* showUser() {
  const username = this.params.username
  try {
    const user = yield this.service.users.getUserInfoByUsername(username)

    this.body = {
      user: {
        id: user._id,
        username: user.username,
        nickname: user.nickname,
        description: user.description,
        avatar: user.avatar
      }
    }
  } catch(err) {
    this.throw(404, 'User not found.')
  }
}

// routing: PUT /api/v1/users/:username
exports.update = function* updateUserInfo() {
  const username = this.params.username
  const { nickname, description, password, avatar } = this.request.body.update
  const { password: currPassword } = this.request.body

  const validated = yield this.service.users.validateUser(username, currPassword)

  if (!validated) return this.throw(403, 'Permission denied.')

  if (nickname) yield this.service.users.updateNickname(username, nickname, currPassword)
  if (description) yield this.service.users.updateDescription(username, description, currPassword)
  if (password) yield this.service.users.updatePassword(username, password, currPassword)
  if (avatar) yield this.service.users.updateAvatar(username, avatar, currPassword)

  const user = yield this.service.users.getUserInfoByUsername(username)

  this.body = {
    user: {
      id: user._id,
      username: user.username,
      nickname: user.nickname,
      description: user.description,
      avatar: user.avatar
    }
  }
}


function saveFileToPublicImages(filename, fileStream) {
  const filepath = path.resolve(__dirname, '../public/images/avatar', filename)
  const writeStream = fs.createWriteStream(filepath)
  fileStream.pipe(writeStream)

  return new Promise((resolve, reject) => {
    fileStream
      .on('end', () => resolve())
      .on('error', err => reject(err))
  })
}

// routing: POST /api/v1/users/:username/avatar
exports.updateAvatar = function* updateAvatar() {
  const username = this.params.username
  if (this.user.username !== username) {
    return this.throw(403, 'Permission denied.')
  }

  const stream = yield this.getFileStream()
  yield saveFileToPublicImages(`${username}-${stream.filename}`, stream)
  const avatar = `${this.app.config.url}/public/images/avatar/${username}-${stream.filename}`

  try {
    yield this.service.users.updateAvatar(username, avatar, null, true)

    this.body = {
      code: this.app.CODES.SUCCESS
    }
  } catch(err) {
    this.throw(503, err)
  }
}

// routing: POST /api/v1/users/login
exports.login = function* userLogin() {
  const { username, password } = this.request.body

  const validated = yield this.service.users.validateUser(username, password)

  if (!validated) {
    return this.throw(403, 'Password is not correct.')
  }

  const user = yield this.service.users.getUserInfoByUsername(username)
  this.user = user

  const room = yield this.service.rooms.Room.findOne({ _host: user }).exec()
  const isHost = !!room

  this.body = {
    user: {
      username: user.username,
      nickname: user.nickname,
      description: user.description,
      avatar: user.avatar,
      isHost
    },
    code: this.app.CODES.SUCCESS
  }
}

// routing: POST /api/v1/users/logout
exports.logout = function* userLogout() {
  if (!this.user) {
    return this.throw(403, 'Illage operation')
  }

  this.user = null
  this.session.loginToken = null

  this.body = {
    code: this.app.CODES.SUCCESS
  }
}

// routing: GET /api/v1/users/show
exports.showCurr = function* showCurrLoginedUser() {
  if (!this.user) {
    return this.throw(401, 'Not logined')
  } else {

    const room = yield this.service.rooms.Room.findOne({ _host: this.user }).exec()
    const isHost = !!room

    this.body = {
      user: {
        username: this.user.username,
        nickname: this.user.nickname,
        description: this.user.description,
        avatar: this.user.avatar,
        isHost
      }
    }
  }
}

// routing: GET /api/v1/users/:username/subscriptions
exports.getSubscriptions = function* getUserSubscriptions() {
  const username = this.params.username

  try {
    const user = yield this.service.users.getUserInfoByUsername(username)

    const subscriptions = yield this.service.subscriptions.findUserSubscriptions(user)

    this.body = {
      subscriptions
    }
  } catch(err) {
    this.throw(err)
  }
}

// routing: GET /api/v1/users/:username/room
exports.showRoom = function* showHostRoom() {
  const username = this.params.username

  try {
    const user = yield this.service.users.getUserInfoByUsername(username)

    const room = yield this.service.rooms.Room.findOne({ _host: user })
      .populate('category')
      .exec()

    const category = room.category

    this.body = {
      room: {
        _id: room._id,
        title: room.title,
        active: room.active,
        lastActive: room.lastActive,
        description: room.description,

        category: {
          _id: category._id,
          title: category.title,
          name: category.name,
          icon: category.icon
        },
        host: {
          _id: user._id,
          username: user.username,
          nickname: user.nickname,
          description: user.description,
          avatar: user.avatar
        }
      }
    }
  } catch(err) {
    this.throw(503, err)
  }
}