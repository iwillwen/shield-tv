/**
 * HostApplications API
 */

// routing: POST /api/v1/hostapplications
exports.create = function* createHostApplication() {
  if (!this.user) {
    return this.throw(401, 'Not logined')
  }

  const { contact, realname, remark, content, category } = this.request.body

  try {
    const application = yield this.service.hostApplications.createHostApplication(
      this.user, contact, realname, remark, content, category
    )

    this.body = {
      application: {
        content, realname, remark, content
      }
    }
  } catch(err) {
    this.throw(503, err)
  }
}

// routing: GET /api/v1/hostapplications
exports.list = function* listHostApplications() {
  try {
    const applications = yield this.service.hostApplications.listAllAvailableApplications() 

    this.body = {
      applications
    }
  } catch(err) {
    this.throw(503, err)
  }
}

// routing: POST /api/v1/hostapplications/:id/accept
exports.accept = function* acceptHostApplication() {
  // TODO: Administrator Permission Validate
  const id = this.params.id

  try {
    const application = yield this.service.hostApplications.getApplication(id)
    const host = application.user
    const category = application.category

    const room = yield this.service.rooms.createRoom(
      `${host.nickname}的${category.title}直播间`, /* title */
      host,                                      /* host */
      category,                                  /* category */
      host.description                           /* description */
    )

    yield this.service.hostApplications.removeApplication(application._id)

    room.id = room._id

    this.body = {
      room,
      streamKey: this.app.genStreamKey(room.id)
    }
  } catch(err) {
    this.throw(503, err)
  }
}

// routing: DELETE /api/v1/hostapplications/:id
exports.remove = function* removeHostApplications() {
  try {
    const id = this.params.id

    yield this.service.hostApplications.removeApplication(id)

    this.body = {
      code: this.app.CODES.SUCCESS
    }
  } catch(err) {
    this.throw(503, err)
  }
}