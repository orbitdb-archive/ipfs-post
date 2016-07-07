'use strict';

const Post = require('./BasePost');

// A reference to a file
class FilePost extends Post {
  constructor(name, hash, size, meta) {
    super("file");
    this.name = name;
    this.hash = hash;
    this.size = size || - 1;
    this.meta = meta || {};
  }
}

module.exports = FilePost;
