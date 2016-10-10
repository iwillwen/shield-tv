const send = require('koa-send')
const path = require('path')

module.exports = function* homeController() {
  yield send(this, 'index.html', { root: __dirname + '/../public' })
}