// Development config

exports.streams = {
  apiUrl: 'http://192.168.59.103:1985/api/v1',
  serverUrl: 'http://192.168.59.103:8081'
}

exports.mongo = 'mongodb://192.168.59.103:27017/shield-tv'
exports.redis = {
  port: 6379,
  host: '192.168.59.103',
  family: 4,
  password: 'shieldtv',
  db: 0
}
exports.url = 'http://localhost:7001'
exports.defaultAvatar = `${exports.url}/images/default-avatar.png`