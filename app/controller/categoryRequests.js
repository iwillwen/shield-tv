/**
 * CategoryRequests API
 */

const path = require('path')
const fs = require('fs')

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

// routing: POST /api/v1/categoryrequests
exports.create = function* createCategoryRequest() {
  if (!this.user) {
    return this.throw(403, 'Not logined')
  }

  const stream = yield this.getFileStream()
  const { title, name } = stream.fields
  yield saveFileToPublicImages(`${name}-${stream.filename}`, stream)
  const icon = `${this.app.config.url}/public/images/categories/${name}-${stream.filename}`

  try {
    const request = yield this.service.categoryRequests.createRequest(
      title, name, icon, this.user
    )

    this.body = {
      categoryRequest: request
    }
  } catch(err) {
    this.throw(503, err)
  }
}

// routing: GET /api/v1/categoryrequests
exports.list = function* listAllCategoryRequests() {
  try {
    const requests = yield this.service.categoryRequests.listRequests()

    this.body = {
      categoryRequests: requests
    }
  } catch(err) {
    this.throw(503, err)
  }
}

// routing: POST /api/v1/categoryrequests/:id/accept
exports.accept = function* acceptCategoryRequest() {
  if (!this.user && !this.user.isAdmin) {
    return this.throw(403, 'Not logined')
  }

  const id = this.params.id

  try {
    const category = yield this.service.categoryRequests.acceptRequest(id)

    this.body = category
  } catch(err) {
    this.throw(503, err)
  }
}