'use strict'

const fs = require('fs')
const path = require('path')

module.exports = appInfo => {
  const exports = {}

  // organization your app middlewares
  exports.middleware = [
    'responseTime',
    'userSession',
    'static'
  ]

  exports.security = false

  exports.siteFile = {
    '/favicon.ico': fs.readFileSync(path.join(appInfo.baseDir, 'app/public/favicon.png')),
  }

  // config for middleware / plugin
  exports.responseTime = {
    header: 'x-response-time',
  }

  exports.streams = {
    apiUrl: 'http://localhost:1985/api/v1',
    serverUrl: 'http://shieldtv.lifemap.in:8081'
  }

  exports.defaultBroadcastRoom = {
    title: '头盔 TV 直播间',
    description: '这家伙很懒，神tm什么都不写'
  }

  exports.keys = [ 'shield-tv', 'broadcast', 'streaming' ].join()

  exports.mongo = 'mongodb://localhost:32769/shield-tv'
  exports.redis = {
    port: 6379,          // Redis port
    host: '127.0.0.1',   // Redis host
    family: 4,           // 4 (IPv4) or 6 (IPv6)
    password: 'shieldtv',
    db: 0
  }
  exports.streamKeySecret = 'shield-tv-room'
  exports.passwordSecret = 'shield-tv'
  exports.url = 'http://shieldtv.lifemap.in'
  exports.defaultAvatar = `${exports.url}/public/images/default_avatar.png`

  return exports
}
