'use strict'

module.exports = app => {

  app.get('/', app.controller.home)

  const apiRoot = '/api/v1'

  // Users API
  app.post(`${apiRoot}/users`, app.controller.users.create)
  app.get(`${apiRoot}/users/show`, app.controller.users.showCurr)
  app.get(`${apiRoot}/users/:username`, app.controller.users.show)
  app.get(`${apiRoot}/users/:username/subscriptions`, app.controller.users.getSubscriptions)
  app.put(`${apiRoot}/users/:username`, app.controller.users.update)
  app.post(`${apiRoot}/users/login`, app.controller.users.login)
  app.post(`${apiRoot}/users/logout`, app.controller.users.logout)
  app.post(`${apiRoot}/users/:username/avatar`, app.controller.users.updateAvatar)
  app.get(`${apiRoot}/users/:username/room`, app.controller.users.showRoom)

  // Categories API
  app.post(`${apiRoot}/categories`, app.controller.categories.create)
  app.get(`${apiRoot}/categories`, app.controller.categories.list)
  app.get(`${apiRoot}/categories/:name`, app.controller.categories.show)
  app.delete(`${apiRoot}/categories/:id`, app.controller.categories.remove)
  app.get(`${apiRoot}/categories/:name/rooms`, app.controller.categories.showRooms)

  // HostApplications API
  app.post(`${apiRoot}/hostapplications`, app.controller.hostapplications.create)
  app.get(`${apiRoot}/hostapplications`, app.controller.hostapplications.list)
  app.delete(`${apiRoot}/hostapplications/:id`, app.controller.hostapplications.remove)
  app.post(`${apiRoot}/hostapplications/:id/accept`, app.controller.hostapplications.accept)
 
  // Broadcast Rooms API
  app.get(`${apiRoot}/rooms`, app.controller.rooms.list)
  app.get(`${apiRoot}/rooms/:id`, app.controller.rooms.show)
  app.put(`${apiRoot}/rooms/:id`, app.controller.rooms.update)
  app.get(`${apiRoot}/rooms/:id/streamkey`, app.controller.rooms.streamKey)
  app.post(`${apiRoot}/rooms/onpublish`, app.controller.rooms.onStreamPublish)
  app.post(`${apiRoot}/rooms/onunpublish`, app.controller.rooms.onStreamUnpublish)
  app.post(`${apiRoot}/rooms/:id/subscribe`, app.controller.rooms.subscribe)
  app.post(`${apiRoot}/rooms/:id/unsubscribe`, app.controller.rooms.unsubscribe)
  app.get(`${apiRoot}/rooms/:id/screenshot`, app.controller.rooms.screenshot)

  // Comments API
  app.post(`${apiRoot}/comments`, app.controller.comments.sendComment)

  // CategorySubscriptions API
  app.post(`${apiRoot}/starredcategories/:name`, app.controller.categorySubscriptions.create)
  app.get(`${apiRoot}/starredcategories`, app.controller.categorySubscriptions.show)

  // CategoryRequests API
  app.post(`${apiRoot}/categoryrequests`, app.controller.categoryRequests.create)
  app.get(`${apiRoot}/categoryrequests`, app.controller.categoryRequests.list)
  app.post(`${apiRoot}/categoryrequests/:id/accept`, app.controller.categoryRequests.accept)
}