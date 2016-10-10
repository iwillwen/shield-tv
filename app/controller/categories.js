/**
 * Categories API
 */

const fs = require('fs')
const path = require('path')

function saveFileToPublicImages(filename, fileStream) {
  const filepath = path.resolve(__dirname, '../public/images/categories', filename)
  const writeStream = fs.createWriteStream(filepath)
  fileStream.pipe(writeStream)

  return new Promise((resolve, reject) => {
    fileStream
      .on('end', () => resolve())
      .on('error', err => reject(err))
  })
}

// routing: POST /api/v1/categories
exports.create = function* createCategory() {
  const stream = yield this.getFileStream()
  const { title, name } = stream.fields
  yield saveFileToPublicImages(stream.filename, stream)
  const icon = `${this.app.config.url}/public/images/categories/${stream.filename}`

  const category = yield this.service.categories.createCategory(
    title, name, icon
  )

  this.body = {
    category
  }
}

// routing: GET /api/v1/categories
exports.list = function* listAllCategories() {
  const categories = yield this.service.categories.getAllCategories()

  this.body = {
    categories
  }
}

// routing: GET /api/v1/categories/:name
exports.show = function* showCategory() {
  const name = this.params.name

  try {
    const category = yield this.service.categories.getCategory(name)

    this.body = {
      category
    }
  } catch(err) {
    if (err.message === 'Category not found') {
      this.throw(404, err.message)
    } else {
      this.throw(503, err.message)
    }
  }
}

// routing: DELETE /api/v1/categories/:id
exports.remove = function* removeCategory() {
  if (!this.user || !this.user.isAdmin) {
    return this.throw(403, 'Permission denined')
  }
  
  const id = this.params.id

  try {
    this.body = yield this.service.categories.removeCategory(id)
  } catch(err) {
    this.throw(503, err)
  }
}

// routing: GET /api/v1/categories/:name/rooms
exports.showRooms = function* showRooms() {
  const name = this.params.name

  try {
    const category = yield this.service.categories.getCategory(name)

    let rooms = yield this.service.rooms.getRoomsByCategory(category)
    rooms = rooms.map(room => {
      room.screenshot = `/api/v1/rooms/${room._id}/screenshot`
      return room
    })

    this.body = {
      rooms
    }
  } catch(err) {
    if (err.message === 'Category not found') {
      this.throw(404, err.message)
    } else {
      this.throw(503, err.message)
    }
  }
}