const fetch = require('node-fetch')

module.exports = app => {

  let Room = null

  /**
   * Room Service
   */
  class Rooms extends app.Service {
    constructor(ctx) {
      super(ctx)

      this.apiUrl = this.app.config.apiUrl

      if (!Room) {
        // Room Schema
        Room = app.mongo.model('Room', {
          title: {
            type: String,
            default: app.config.defaultBroadcastRoom.title
          },
          name: String,
          _host: {
            type: app.mongo.Schema.Types.ObjectId,
            ref: 'User'
          },
          category: {
            type: app.mongo.Schema.Types.ObjectId,
            ref: 'Category'
          },
          active: {
            type: Boolean,
            default: false
          },
          lastActive: Date,
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
      }

      this.Room = Room
    }

    /**
     * Create new broadcast room
     *
     * @param {String} title The title of the room
     * @param {User} host The room host
     * @param {Category} category Room's category
     * @param {String} description Room's description
     *
     * @returns {Room} room object
     * @returns {String} room's id
     */
    * createRoom(title, host, category, description = app.config.defaultBroadcastRoom.description) {
      const room = new Room({
        title, description, category,
        _host: host,
        name: host.username,
        lastActive: Date.now()
      })

      yield room.save()
      
      return room
    }

    /**
     * Get all available broadcast rooms
     *
     * @return {Array[Room]} available rooms
     */
    * getAllRooms() {
      const rooms = yield Room.find({})
        .populate('_host')
        .populate('category')
        .exec()

      return rooms.map(room => {
        const host = room._host
        const category = room.category

        return {
          _id: room._id,
          title: room.title,
          name: room.name,
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
            _id: host._id,
            username: host.username,
            nickname: host.nickname,
            description: host.description,
            avatar: host.avatar
          }
        }
      })
    }

    /**
     * Get room
     *
     * @param {String} id room's id
     *
     * @return {Room} broadcast room
     */
    * getRoom(id) {
      const room = yield Room.findById(id)
        .populate('_host')
        .populate('category')
        .exec()

      if (!room) return null

      const host = room._host
      const category = room.category

      return {
        _id: room._id,
        title: room.title,
        name: room.name,
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
          _id: host._id,
          username: host.username,
          nickname: host.nickname,
          description: host.description,
          avatar: host.avatar
        }
      }
    }

    /**
     * Get room
     *
     * @param {String} id room's id
     *
     * @return {Room} broadcast room
     */
    * getRoomByName(name) {
      const room = yield Room.findOne({ name })
        .populate('_host')
        .populate('category')
        .exec()

      if (!room) return null

      const host = room._host
      const category = room.category

      return {
        _id: room._id,
        name: room.name,
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
          _id: host._id,
          username: host.username,
          nickname: host.nickname,
          description: host.description,
          avatar: host.avatar
        }
      }
    }

    /**
     * Get room object
     *
     * @param {String} id room's id
     *
     * @return {Room} broadcast room
     */
    * getRoomObject(id) {
      const room = yield Room.findById(id)
        .populate('_host')
        .populate('category')
        .exec()

      return room
    }

    /**
     * Get all broadcast rooms of category
     *
     * @param {Category} category Category
     *
     * @return {Array[Room]} available rooms
     */
    * getRoomsByCategory(category) {
      try {
        const rooms = yield Room.find({
          category
        })
          .populate('_host')
          .populate('category')
          .exec()

        return rooms.map(room => ({
          _id: room._id,
          name: room.name,
          title: room.title,
          active: room.active,
          lastActive: room.lastActive,
          description: room.description,

          category: {
            _id: room.category._id,
            title: room.category.title,
            name: room.category.name,
            icon: room.category.icon
          },
          host: {
            _id: room._host._id,
            username: room._host.username,
            nickname: room._host.nickname,
            description: room._host.description,
            avatar: room._host.avatar
          }
        }))
      } catch(err) {
        app.logger.error(err)

        throw err
      }
    }

    /**
     * A new viewer enter a broadcast room
     *
     * @param {String} id Room's id
     *
     * @return {Number} Current count of viewers
     */
    * getRoomViewerCount(id) {
      const key = `room:${id}:curr-viewers`
      const exists = yield app.redis.exists(key)
      let currViewers = 0

      if (!exists) {
        currViewers = parseInt(yield app.redis.get(key))
      } else {
        const streams = app.service.streams.getActiveStreams()
        const stream = streams.find(stream => stream.name === id) || { clients: 0 }
        currViewers = stream.clients
        yield app.redis.setex(key, 3 * 60, currViewers) // Cache for 3 minutes
      }

      return currViewer
    }

    /**
     * Update the broadcast room active status
     *
     * @param {String} id Room's id
     * @param {Boolean} isActive New active status
     */
    * updateActiveStatus(id, isActive) {
      const room = yield this.getRoomObject(id)

      room.active = isActive

      // Update lastActive
      if (!isActive) {
        room.lastActive = Date.now()
      }

      try {
        yield room.save()

        return {
          code: app.CODES.SUCCESS,
          active: isActive
        }
      } catch(err) {
        app.logger.error(err)

        return {
          code: app.CODES.FAILED,
          error: err.message
        }
      }
    }

    /**
     * Update room's title
     *
     * @param {String} id Room's id
     * @param {String} title New title
     *
     * @return {Number} operation result
     */
    * updateTitle(id, title) {
      try {
        const room = yield this.getRoomObject(id)
        room.title = title

        yield room.save()

        return app.CODES.SUCCESS
      } catch(err) {
        app.logger.error(err)

        throw err
      }
    }

    /**
     * Update room's description
     *
     * @param {String} id Room's id
     * @param {String} description New description
     *
     * @return {Number} operation result
     */
    * updateDescription(id, description) {
      try {
        const room = yield this.getRoomObject(id)
        room.description = description

        yield room.save()

        return app.CODES.SUCCESS
      } catch(err) {
        app.logger.error(err)

        throw err
      }
    }

    /**
     * Update room's category
     *
     * @param {String} id Room's id
     * @param {Category} category New category
     *
     * @return {Number} operation result
     */
    * updateCategory(id, category) {
      try {
        const room = yield this.getRoomObject(id)
        room.category = category

        yield room.save()

        return app.CODES.SUCCESS
      } catch(err) {
        app.logger.error(err)

        throw err
      }
    }
  }

  return Rooms
}