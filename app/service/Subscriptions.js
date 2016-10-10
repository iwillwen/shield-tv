module.exports = app => {

  let Subscription = null

  /**
   * @class Subscriptions Service
   */
  class Subscriptions extends app.Service {
    constructor(ctx) {
      super(ctx)

      const User = ctx.service.users.User
      const Room = ctx.service.rooms.Room

      if (!Subscription) {
        Subscription = app.mongo.model('Subscription', {
          user: {
            type: app.mongo.Schema.Types.ObjectId,
            ref: 'User'
          },
          room: {
            type: app.mongo.Schema.Types.ObjectId,
            ref: 'Room'
          },
          enabled: {
            type: Boolean,
            default: true
          },
          createdAt: {
            type: Date,
            default: Date.now
          },
          updatedAt: {
            type: Date,
            default: Date.now
          }
        })
      }

      this.Subscription = Subscription
    }

    /**
     * Create new subscription relation
     *
     * @param {User} user The user who sent request
     * @param {Room} room The broadcast room which the user want to subscribe
     *
     * @returns {Subscription} The subscription object
     * @returns {Number} Status code
     */
    * createSubscription(user, room) {
      try {
        yield this.getSubscription(user, room)

        throw 1
      } catch(e) {
        if (e === 1) throw new Error('Subscription was exists.')
      }

      const subscription = new Subscription({
        user, room
      })

      try {
        yield subscription.save()

        return {
          subscription,
          code: app.CODES.SUCCESS
        }
      } catch(err) {
        app.logger.error(err)

        return {
          code: app.CODES.FAILED
        }
      }
    }

    /**
     * Change the subscription status
     *
     * @param {User} user The request sender
     * @param {Room} room The request target broadcast room
     *
     * @returns {Subscription} The subscription object
     * @returns {Number} Status code
     */
    * toggleSubscriptionStatus(user, room) {
      const subscription = getSubscription(user, room)

      if (!subscription) {
        throw new Error('Subscription was exists.')
      }

      subscription.enabled = !subscription.enabled

      try {
        yield subscription.save()

        return {
          subscription,
          code: app.CODES.SUCCESS
        }
      } catch(err) {
        app.logger.error(err)

        return {
          code: app.CODES.FAILED
        }
      }
    }

    /**
     * Find the subscription fit with the condition
     *
     * @param {User} user The follower
     * @param {Room} room The broadcast room
     *
     * @return {Subscription} The subscription object
     */
    * getSubscription(user, room) {
      try {
        const subscription = yield Subscription.findOne({ user, room }).exec()

        if (!subscription) throw new Error('Subscription not found')

        return subscription
      } catch(err) {
        app.logger.error(err)

        throw err
      }
    }

    /**
     * Find all subscriptions fit with the condition
     *
     * @param {User} user The follower
     *
     * @return {Array[Subscription]} The subscriptions
     */
    * findUserSubscriptions(user) {
      try {
        const subscriptions = yield Subscription.find({ user })
          .populate('room')
          .exec()

        return subscriptions
      } catch(err) {
        app.logger.error(err)

        throw err
      }
    }
  }

  return Subscriptions
}