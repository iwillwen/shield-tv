// routing: POST /api/v1/comments
exports.sendComment = function* sendComment() {
  if (!this.user) {
    return this.throw(403, 'Not logined')
  }

  const { room: roomId, content } = this.request.body

  try {
    const room = yield this.service.rooms.getRoomObject(roomId)

    const comment = yield this.service.comments.createComment(
      this.user, room, content
    )

    this.body = {
      comment: {
        content
      }
    }
  } catch(err) {
    this.throw(503, err)
  }
}