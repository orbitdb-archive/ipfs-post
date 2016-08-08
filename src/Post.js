'use strict';

const Buffer        = require('buffer').Buffer;
const Post          = require('./BasePost');
const TextPost      = require('./TextPost');
const FilePost      = require('./FilePost');
const DirectoryPost = require('./DirectoryPost');
const OrbitDBItem   = require('./OrbitDBItem');
const MetaInfo      = require('./MetaInfo');
const Poll          = require('./Poll');
const Crypto        = require('orbit-crypto')

const PostTypes = {
  Message: TextPost,
  Snippet: "snippet",
  File: FilePost,
  Directory: DirectoryPost,
  Link: "link",
  OrbitDBItem: OrbitDBItem,
  Poll: Poll
};

// Factory
class Posts {
  static create(ipfs, type, data, signKey) {
    return new Promise((resolve, reject) => {
      let post;

      if(type === PostTypes.Message) {
        post = new PostTypes.Message(data.content);
      } else if(type === PostTypes.File) {
        post = new PostTypes.File(data.name, data.hash, data.size, data.meta);
      } else if(type == PostTypes.Directory) {
        post = new PostTypes.Directory(data.name, data.hash, data.size);
      } else if(type == PostTypes.OrbitDBItem) {
        post = new PostTypes.OrbitDBItem(data.operation, data.key, data.value);
      } else if(type == PostTypes.Poll) {
        post = new PostTypes.Poll(data.question, data.options);
      }

      const size = data.size ? data.size : Buffer.byteLength(data, 'utf8');
      post.meta = Object.assign(post.meta || {}, new MetaInfo(post.type, size, new Date().getTime(), data.from))
      if(post.type) delete post.type;

      const sign = (key) => {
        let result = {}
        if(key) {
          return Crypto.sign(key, new Buffer(JSON.stringify(post)))
            .then((signature) => result.signature = Buffer.from(signature))
            .then(() => Crypto.exportKeyToIpfs(ipfs, signKey))
            .then((hash) => result.signKeyHash = hash)
            .then(() => result)
        }
        return result;
      }

      sign(signKey)
        .then((result) => {
          if(result.signKeyHash && result.signature) {
            post.sig = result.signature
            post.signKey = result.signKeyHash
            console.log("SIGNATURE", post.sig)
          }
        })
        .then(() => ipfs.object.put(new Buffer(JSON.stringify(post))))
        .then((res) => resolve({ Post: post, Hash: res.toJSON().Hash }))
        .catch(reject);
    });
  }

  static get Types() {
    return PostTypes;
  }
}

module.exports = Posts;
