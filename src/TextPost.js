'use strict';

const Post = require('./BasePost');
// const Encryption = require('orbit-common/lib/Encryption');

// Simplest type of post: a string
class TextPost extends Post {
  constructor(content, replyto) {
    super("text");
    this.content = content;
    this.replyto = replyto;
  }

  // encrypt(privkey, pubkey) {
  //   this.content = Encryption.encrypt(this.content, privkey, pubkey);
  // }
}

module.exports = TextPost;
