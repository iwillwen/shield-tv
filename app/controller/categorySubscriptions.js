/**
 * CategorySubscriptions API
 */

// routing: POST /api/v1/starredcategories/:name
exports.create = function* createCategorySubscription() {
  if (!this.user) {
    return this.throw(403, 'Not logined')
  }

  const categoryName = this.params.name

  try {
    const category = yield this.service.categories.getCategory(categoryName)

    const { categories: starredcategories } = yield this.service.categorySubscriptions.fetchSubscriptionsByUser(this.user)

    if (starredcategories.find(n => n.name === categoryName)) {
      return this.body = {
        code: this.app.CODES.SUCCESS
      }
    }

    const subscription = yield this.service.categorySubscriptions.createSubscription(
      this.user, category
    )

    this.body = {
      code: app.CODES.SUCCESS,
      subscription
    }
  } catch(err) {
    this.throw(503, err)
  }
}

// routing: GET /api/v1/starredcategories
exports.show = function* showStarredCategories() {
  if (!this.user) {
    return this.throw(403, 'Not logined')
  }

  try {
    const { subscriptions, categories } = yield this.service.categorySubscriptions.fetchSubscriptionsByUser(this.user)

    this.body = {
      subscriptions, categories
    }
  } catch(err) {
    this.throw(503, err)
  }
}