const fetch = require('node-fetch')

module.exports = app => {
  /**
   * Streams API Service
   */
  
  class Streams extends app.Service {
    constructor(ctx) {
      super(ctx)

      this.config = this.ctx.app.config.streams
      this.apiUrl = this.config.apiUrl
      this.serverUrl = this.config.serverUrl
    }

    /**
     * Fetch All Stream
     *
     * @return {Array[Object]} available streams
     */
    * getAllStreams() {
      const res = yield fetch(`${this.apiUrl}/streams`)
      const data = yield res.json()
      return data.streams
    }

    /**
     * Fetch All Active Streams
     * 
     * @return {Array[Object]} active streams
     */
    * getActiveStreams() {
      const streams = yield this.getAllStreams()

      return streams.filter(stream => stream.publish.active)
    }
  }

  return Streams
}