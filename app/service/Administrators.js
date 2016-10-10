module.exports = app => {

  let Administrator = null

  class Administrators extends app.Service {
    constructor(ctx) {
      super(ctx)

      if (!Administrator) {
        const User = ctx.service.users.User

        Administrator = app.mongo.model('Administrator', {
          user: {
            type: app.mongo.Schema.Types.ObjectId,
            ref: 'User'
          }
        })
      }
      
      this.Administrator = Administrator
    }

    * assignAdministrator(user) {
      const admin = new Administrator({ user })

      try {
        yield admin.save()

        return admin
      } catch(err) {
        app.logger.error(err)

        throw err
      }
    }

    * checkAdministrator(user) {
      try {
        const admin = yield Administrator.findOne({ user }).exec()

        return !!admin
      } catch(err) {
        app.logger.error(err)

        return false
      }
    }
  }

  return Administrators
}