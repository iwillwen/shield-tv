/**
 * Rooms API
 */

const url = require('url')

// routing: GET /api/v1/rooms
exports.list = function* listAllBroadcastRooms() {
  try {
    const rooms = yield this.service.rooms.getAllRooms()

    this.body = {
      rooms
    }
  } catch(err) {
    this.throw(503, err)
  }
}

// routing: GET /api/v1/rooms/:id
exports.show = function* showBroadcastRoom() {
  const id = this.params.id

  try {
    let room1 = null
    let room2 = null

    try {
      room1 = yield this.service.rooms.getRoom(id)
    } catch(err) {}
    try {
      room2 =yield this.service.rooms.getRoomByName(id)
    } catch(err) {}
    const room = room1 || room2

    room.streamKey = this.app.genStreamKey(room._id.toString())
    room.screenshot = `/api/v1/room/${room._id.toString()}/screenshot`

    this.body = {
      room
    }
  } catch(err) {
    this.throw(503, err)
  }
}

// routing: GET /api/v1/rooms/:id/streamkey
exports.streamKey = function* getStreamKey() {
  if (!this.user) {
    return this.throw(401, 'Not logined')
  }

  const id = this.params.id
  const room = yield this.service.rooms.getRoom(id)

  if (room.host.username !== this.user.username) {
    return this.throw(403, 'Permission denied')
  }

  this.body = {
    streamKey: this.app.genStreamKey(room._id.toString())
  }
}

// routing: POST /api/v1/rooms/:id/subscibe
exports.subscribe = function* subscibeRoom() {
  if (!this.user) {
    return this.throw(403, 'Not logined')
  }

  const user = this.user
  const roomId = this.params.id

  try {
    const room = yield this.service.rooms.getRoomObject(roomId)

    const subscription = yield this.service.subscriptions.createSubscription(user, room)

    this.body = {
      code: this.app.CODES.SUCCESS
    }
  } catch(err) {
    this.throw(503, err)
  }
}

// routing: POST /api/v1/rooms/:id/unsubscribe
exports.unsubscribe = function* unsubscribeRoom() {
  if (!this.user) {
    return this.throw(403, 'Not logined')
  }

  const user = this.user
  const roomId = this.params.id

  try {
    yield this.service.subscriptions.toggleSubscriptionStatus(user, room)

    this.body = {
      code: this.app.CODES.SUCCESS
    }
  } catch(err) {
    this.throw(503, err)
  }
}

// routing: POST /api/v1/rooms/onpublish
exports.onStreamPublish = function* handleStreamPublish() {
  const { stream: streamKey } = this.request.body
  const roomId = this.app.decodeStreamKey(streamKey)

  try {
    yield this.service.rooms.updateActiveStatus(roomId, true)
  } catch(err) {
    this.logger.error(err)
  } finally {
    this.body = this.app.CODES.SUCCESS
  }
}

// routing: POST /api/v1/rooms/onunpublish
exports.onStreamUnpublish = function* handleStreamUnpublish() {
  const { stream: streamKey } = this.request.body
  const roomId = this.app.decodeStreamKey(streamKey)

  try {
    yield this.service.rooms.updateActiveStatus(roomId, false)
  } catch(err) {
    this.logger.error(err)
  } finally {
    this.body = this.app.CODES.SUCCESS
  }
}

// routing: GET /api/v1/rooms/:id/screenshot
exports.screenshot = function* showScreenshot() {
  const id = this.params.id

  try {
    const room = yield this.service.rooms.getRoom(id)
    const urlInfo = url.parse(this.app.config.streams.serverUrl)
    const host = `${urlInfo.protocol}//${urlInfo.hostname}:8085`
    const to = `${host}/live/${this.app.genStreamKey(room._id.toString())}-best.png`

    this.redirect(to)
  } catch(err) {
    if (err.message === 'Room not found') {
      this.throw(404, err.message)
    } else {
      this.throw(503, err.message)
    }
  }
}

// routing: PUT /api/v1/rooms/:id
exports.update = function* updateRoomInfomations() {
  if (!this.user) {
    return this.throw(403, 'Not logined')
  }

  const id = this.params.id

  try {
    const room = yield this.service.rooms.getRoom(id)

    if (this.user._id.toString() !== room.host._id.toString()) {
      return this.throw(403, 'Permission denied.')
    }

    const { title, description, category: categoryName } = this.request.body.update

    if (title) yield this.service.rooms.updateTitle(id, title)
    if (description) yield this.service.rooms.updateDescription(id, description)
    if (categoryName) {
      const category = yield this.service.categories.getCategory(categoryName)
      yield this.service.rooms.updateCategory(id, category)
    }

    this.body = {
      code: this.app.CODES.SUCCESS
    }
  } catch(err) {
    this.throw(503, err)
  }
}

// TODO: hot rooms