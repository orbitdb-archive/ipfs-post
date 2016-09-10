'use strict'

const Post = require('./BasePost')

class PinnedPost extends Post {
  constructor(pinned) {
    super("pin")
    this.pinned = pinned
  }
}

module.exports = PinnedPost
