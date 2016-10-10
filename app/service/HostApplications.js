module.exports = app => {

  let HostApplication = null

  class HostApplications extends app.Service {
    constructor(ctx) {
      super(ctx)

      if (!HostApplication) {
        const User = ctx.service.users.User
        const Category = ctx.service.categories.Category

        // HostApplication Schema
        HostApplication = this.HostApplication = app.mongo.model('HostApplication', {
          user: {
            type: app.mongo.Schema.Types.ObjectId,
            ref: 'User'
          },
          category: {
            type: app.mongo.Schema.Types.ObjectId,
            ref: 'Category'
          },
          contact: String,
          realname: String,
          remark: String,
          content: String,
          createdAt: {
            type: Date,
            default: Date.now
          }
        })
      }

      this.HostApplication = HostApplication
    }

    * createHostApplication(user, contact, realname, remark, content, categoryName) {
      try {
        const category = yield this.ctx.service.categories.getCategory(categoryName)

        const application = new HostApplication({
          user, contact, realname, remark, content, category
        })

        yield application.save()

        return application
      } catch(err) {
        app.logger.error(err)

        throw err
      }
    }

    * listAllAvailableApplications() {
      try {
        const applications = yield HostApplication.find({})
          .populate('user')
          .populate('category')
          .exec()

        return applications
      } catch(err) {
        app.logger.error(err)

        throw err
      }
    }

    * getApplication(id) {
      try {
        const application = yield HostApplication.findById(id)
          .populate('user')
          .populate('category')
          .exec()

        return application
      } catch(err) {
        app.logger.error(err)

        throw err
      }
    }

    * removeApplication(id) {
      try {
        const res = yield HostApplication.findOneAndRemove({ _id: id }).exec()

        return {
          code: app.CODES.SUCCESS
        }
      } catch(err) {
        app.logger.error(err)

        throw err
      }
    }
  }

  return HostApplications
}