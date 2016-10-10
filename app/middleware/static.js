const serve = require('koa-static')
const mount = require('koa-mount')
const path = require('path')
const compose = require('koa-compose')
const compress = require('koa-compress')

const root = path.resolve(__dirname, '../public')

module.exports = function() {
  return compose([
    compress({
      filter: content_type => /text|javascript|json/i.test(content_type),
      threshold: 2048,
      flush: require('zlib').Z_SYNC_FLUSH
    }),
    mount('/public', serve(root))
  ])
}