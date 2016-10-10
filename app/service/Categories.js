module.exports = app => {

  // Category Schema
  const Category = app.mongo.model('Category', {
    title: String,
    name: String,
    icon: String,
    weight: {
      type: Number,
      default: 0
    }
  })

  /**
   * Category Service
   */
  class Categories extends app.Service {
    constructor(ctx) {
      super(ctx)

      this.Category = Category
    }

    /**
     * Create a new category
     *
     * @param {String} title Category's screen name
     * @param {String} name Category's name
     * @param {String} icon Category's icon url
     *
     * @return {Category} category object
     */
    * createCategory(title, name, icon) {
      const category = new Category({ title, name, icon })

      try {
        yield category.save()

        category.code = app.CODES.SUCCESS

        return category
      } catch(err) {
        app.logger.error(err)

        return {
          code: app.CODES.FAILED,
          error: err.message
        }
      }
    }

    /**
     * Get all categories
     *
     * @return {Array[Category]} Categories
     */
    * getAllCategories() {
      try {
        const categories = yield Category.find({}).exec()
        categories.code = app.CODES.SUCCESS

        return categories
      } catch(err) {
        app.logger.error(err)

        return {
          code: app.CODES.FAILED,
          error: err.message
        }
      }
    }

    /**
     * Get a category
     *
     * @param {String} name The name of category
     *
     * @return {Category} Category
     */
    * getCategory(name) {
      try {
        const category = yield Category.findOne({ name }).exec()

        return category
      } catch(err) {
        app.logger.error(err)

        throw new Error('Category not found')
      }
    }

    /**
     * Remove a category
     *
     * @param {String} id The id of category
     */
    * removeCategory(id) {
      try {
        yield Category.findOneAndRemove({
          _id: id
        }).exec()

        return {
          code: app.CODES.SUCCESS
        }
      } catch(err) {
        app.logger.error(err)

        throw err
      }
    }
  }

  return Categories
}