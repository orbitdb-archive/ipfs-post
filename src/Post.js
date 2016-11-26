'use strict';

const Post          = require('./BasePost');
const TextPost      = require('./TextPost');
const PinnedPost    = require('./PinnedPost');
const FilePost      = require('./FilePost');
const DirectoryPost = require('./DirectoryPost');
const OrbitDBItem   = require('./OrbitDBItem');
const MetaInfo      = require('./MetaInfo');
const Poll          = require('./Poll');
const Crypto        = require('orbit-crypto')

const PostTypes = {
  Message: TextPost,
  Pin: PinnedPost,
  Snippet: "snippet",
  File: FilePost,
  Directory: DirectoryPost,
  Link: "link",
  OrbitDBItem: OrbitDBItem,
  Poll: Poll
};

// Factory
class Posts {
  static create(ipfs, type, data, keys) {
    return new Promise((resolve, reject) => {
      let post;

      if(type === PostTypes.Message) {
        post = new PostTypes.Message(data.content, data.replyto);
      } else if(type === PostTypes.Pin) {
        post = new PostTypes.Pin(data.pinned);
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
          return Crypto.sign(key.privateKey, new Buffer(JSON.stringify(post)))
            .then((signature) => result.signature = signature)
            .then(() => Crypto.exportKeyToIpfs(ipfs, key.publicKey))
            .then((hash) => result.signKeyHash = hash)
            .then(() => result)
        }
        return result;
      }

      sign(keys)
        .then((result) => {
          if(result.signKeyHash && result.signature) {
            post.sig = result.signature
            post.signKey = result.signKeyHash
          }
        })
        .then(() => ipfs.object.put(new Buffer(JSON.stringify(post))))
        .then((res) => resolve({ Post: post, Hash: res.toJSON().multihash }))
        .catch(reject);
    });
  }

  static get Types() {
    return PostTypes;
  }
}

module.exports = Posts;
