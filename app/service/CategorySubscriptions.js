module.exports = app => {

  let CategorySubscription = null

  class CategorySubscriptions extends app.Service {
    constructor(ctx) {
      super(ctx)

      if (!CategorySubscription) {
        CategorySubscription = app.mongo.model('CategorySubscription', {
          user: {
            type: app.mongo.Schema.Types.ObjectId,
            ref: 'User'
          },
          category: {
            type: app.mongo.Schema.Types.ObjectId,
            ref: 'Category'
          },
          enabled: {
            type: Boolean,
            default: true
          }
        })
      }

      this.CategorySubscription = CategorySubscription
    }

    * createSubscription(user, category) {
      const subscription = new CategorySubscription({
        user, category
      })

      try {
        yield subscription.save()

        return subscription
      } catch(err) {
        app.logger.error(err)

        throw err
      }
    }

    * fetchSubscriptionsByUser(user) {
      try {
        const subscriptions = yield CategorySubscription.find({ user })
          .populate('category')
          .exec()

        const categories = subscriptions.map(n => n.category)

        return {
          subscriptions,
          categories
        }
      } catch(err) {
        app.logger.error(err)

        throw err
      }
    }

    * disableSubscription(id) {
      try {
        const subscription = yield CategorySubscription.findById(id).exec()
        subscription.enabled = false
        yield subscription.save()

        return {
          code: app.CODES.SUCCESS
        }
      } catch(err) {
        app.logger.error(err)

        throw err
      }
    }
  }

  return CategorySubscriptions
}