const mongoose = require('mongoose')
const Redis = require('ioredis')
const crypto = require('crypto')
const WebSocketServer = require('ws').Server

module.exports = app => {
  // MongoDB Configure
  mongoose.Promise = Promise
  mongoose.connect(app.config.mongo)

  // Redis Configure
  const redis = new Redis(app.config.redis)
  const subRedis = new Redis(app.config.redis)
  const pubRedis = new Redis(app.config.redis)

  app.mongo = mongoose
  app.redis = redis
  app.subRedis = subRedis
  app.pubRedis = pubRedis


  app.CODES = {
    SUCCESS: 0,
    FAILED: 1
  }

  // Broadcast room stream key
  app.genStreamKey = function genStreamKey(key1) {
    const cipher = crypto.createCipher('aes192', app.config.streamKeySecret)

    const s = cipher.update(app.config.streamKeySecret + key1 + app.config.streamKeySecret, 'utf8', 'hex')

    return s + cipher.final('hex')
  }

  app.decodeStreamKey = function decodeStreamKey(streamKey) {
    const decipher = crypto.createDecipher('aes192', app.config.streamKeySecret)

    const s = decipher.update(streamKey, 'hex', 'utf8')

    return (s + decipher.final('utf8')).replace(new RegExp(`^${app.config.streamKeySecret}|${app.config.streamKeySecret}$`, 'g'), '')
  }


  // WebSocket
  app.on('server', server => {
    app.wsserver = new WebSocketServer({
      server,
      path: '/api/v1/comments'
    })
    app.emit('wsserver', app.wsserver)
  })
}