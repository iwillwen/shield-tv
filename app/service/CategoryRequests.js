module.exports = app => {

  let CategoryRequest = null

  class CategoryRequests extends app.Service {
    constructor(ctx) {
      super(ctx)

      if (!CategoryRequest) {
        CategoryRequest = app.mongo.model('CategoryRequest', {
          title: String,
          name: String,
          icon: String,
          user: {
            type: app.mongo.Schema.Types.ObjectId,
            ref: 'User'
          }
        })
      }

      this.CategoryRequest = CategoryRequest
    }

    * createRequest(title, name, icon, user) {
      const request = new CategoryRequest({
        title, name, icon, user
      })

      try {
        yield request.save()

        return {
          title, name, icon
        }
      } catch(err) {
        app.logger.error(err)

        throw err
      }
    }

    * listRequests() {
      try {
        const requests = yield CategoryRequest.find({}).exec()

        return requests
      } catch(err) {
        app.logger.error(err)

        throw err
      }
    }

    * acceptRequest(id) {
      try {
        const request = yield CategoryRequest.findById(id).exec()

        const category = yield this.ctx.service.categories.createCategory(
          request.title, request.name, request.icon
        )

        yield request.remove()

        // TODO: Send a message to request's owner

        return {
          category
        }
      } catch(err) {
        app.logger.error(err)

        throw err
      }
    }
  }

  return CategoryRequests
}