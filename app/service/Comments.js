let wsserver = null
const sockets = new Map()

const MSG_TYPES = {
  handshake: 0,
  comment: 1
}

module.exports = app => {

  let Comment = null

  app.subRedis.subscribe('newComment', 'sendComment')

  app.subRedis.on('message', (channel, message) => {
    if (channel !== 'newComment') return

    try {
      const data = JSON.parse(message)

      const roomId = data.room

      for (const socket of sockets.get(roomId)) {
        socket.send(message)
      }
    } catch(err) {

    }
  })

  // Handle the handshake request
  const CommentsWSHandler = {
    handleMessage(message, socket) {
      try {
        const data = JSON.parse(message)

        switch (data.type) {

          case MSG_TYPES.handshake:
            this.handleHandshake(data, socket)
            break
        }
      } catch(err) {
        app.logger.error(err)
      }
    },

    handleHandshake(data, socket) {
      const roomId = data.room

      if (!sockets.has(roomId)) sockets.set(roomId, new Set())

      sockets.get(roomId).add(socket)
    },

    applyWSServer(wsserver) {
      wsserver.on('connection', socket => {
        socket.on('message', msg => this.handleMessage(msg, socket))
      })
    }
  }

  if (app.wsserver) {
    wsserver = app.wsserver
    CommentsWSHandler.applyWSServer(wsserver)
  } else {
    app.on('wsserver', _wsserver => {
      wsserver = _wsserver
      CommentsWSHandler.applyWSServer(wsserver)
    })
  }

  class Comments extends app.Service {
    constructor(ctx) {
      super(ctx)

      if (!Comment) {
        const User = ctx.service.users.User
        const Room = ctx.service.rooms.Room

        Comment = app.mongo.model('Comment', {
          user: {
            type: app.mongo.Schema.Types.ObjectId,
            ref: 'User'
          },
          room: {
            type: app.mongo.Schema.Types.ObjectId,
            ref: 'Room'
          },
          content: {
            type: String,
            default: ''
          },
          createdAt: {
            type: Date,
            default: Date.now
          }
        })
      }
      
      this.Comment = Comment
    }

    /**
     * Post a new comment
     *
     * @param {User} user Comment's owner
     * @param {Room} room Target broadcast room
     *
     * @return {Comment} Comment object
     */
    * createComment(user, room, content) {
      const comment = new Comment({
        user, room, content
      })

      try {
        yield comment.save()

        app.pubRedis.publish('newComment', JSON.stringify({
          room: room._id,
          user: {
            username: user.username,
            nickname: user.nickname
          },
          content
        }))

        return comment
      } catch(err) {
        app.logger.error(err)

        throw err
      }
    }
  }

  return Comments
}